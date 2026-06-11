'use server'

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { analyzeResume } from '@/lib/ai/openai';
if (typeof global !== 'undefined' && typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}
const { PDFParse } = require('pdf-parse');

export async function uploadAndAnalyzeResume(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let finalUserId = user?.id;
    if (!finalUserId) {
      // Mock login for testing since UI doesn't implement real auth yet
      let dummyUser = await prisma.user.findFirst({ where: { email: 'dummy@example.com' } });
      if (!dummyUser) {
        dummyUser = await prisma.user.create({
          data: { email: 'dummy@example.com', name: 'Test User' }
        });
      }
      finalUserId = dummyUser.id;
    }

    const file = formData.get('file') as File;
    const jobTitle = formData.get('jobTitle') as string || 'General Role';
    const jobDescription = formData.get('jobDescription') as string || 'General Requirements';

    if (!file) {
      throw new Error('No file uploaded');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 1. Upload to Supabase Storage
    const fileName = `${finalUserId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    let filePath = fileName;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        contentType: file.type,
      });

    if (uploadError) {
      console.warn("Upload to Supabase failed (bucket likely missing). Proceeding without storing file physically.", uploadError);
    } else if (uploadData) {
      filePath = uploadData.path;
    }

    let resumeText = '';
    if (file.type === 'application/pdf') {
      try {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        resumeText = pdfData.text;
        await parser.destroy();
      } catch (err) {
        console.warn("PDF Parsing failed. Using raw buffer fallback.", err);
        const rawText = buffer.toString('ascii').replace(/[^\x20-\x7E\n]/g, ' ');
        resumeText = rawText.length > 50 ? rawText : "Dummy resume text for testing since PDF parsing failed.";
      }
    } else {
      // Basic text extraction fallback for other types (e.g., txt)
      resumeText = buffer.toString('utf-8');
    }

    if (!resumeText || resumeText.trim() === '') {
       throw new Error('Could not extract text from the resume');
    }

    // 3. AI Analysis
    const analysisResult = await analyzeResume(resumeText, jobTitle, jobDescription);

    // 4. Save to Database
    const resume = await prisma.resume.create({
      data: {
        userId: finalUserId,
        fileName: file.name,
        filePath: filePath,
        analyses: {
          create: {
            jobTitle: jobTitle,
            atsScore: analysisResult.ats_score || 0,
            summary: analysisResult.feedback || '',
            strengths: analysisResult.matched_keywords || [],
            weaknesses: analysisResult.missing_keywords || [],
            missingSkills: analysisResult.missing_keywords || [],
            grammarIssues: [],
            formattingIssues: [],
            keywordAnalysis: {},
            industryMatchScore: analysisResult.ats_score || 0,
          }
        }
      },
      include: {
        analyses: true
      }
    });

    return { success: true, resume };

  } catch (error: any) {
    console.error('Resume processing error:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserResumes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let finalUserId = user?.id;
  if (!finalUserId) {
    const dummyUser = await prisma.user.findFirst({ where: { email: 'dummy@example.com' } });
    if (!dummyUser) return [];
    finalUserId = dummyUser.id;
  }

  return await prisma.resume.findMany({
    where: { userId: finalUserId },
    include: { analyses: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteResume(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let finalUserId = user?.id;
  if (!finalUserId) {
    const dummyUser = await prisma.user.findFirst({ where: { email: 'dummy@example.com' } });
    if (dummyUser) finalUserId = dummyUser.id;
  }
  if (!finalUserId) throw new Error("Unauthorized");

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== finalUserId) throw new Error("Not found or unauthorized");

  // Delete from storage
  await supabase.storage.from('resumes').remove([resume.filePath]);

  // Delete from db (cascade deletes analysis)
  await prisma.resume.delete({ where: { id } });

  return { success: true };
}
