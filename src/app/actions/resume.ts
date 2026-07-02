'use server'

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { analyzeResume } from '@/lib/ai/openai';
if (typeof global !== 'undefined' && typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}
const pdfParse = require('pdf-parse');

export async function uploadAndAnalyzeResume(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user?.id) {
      throw new Error("Unauthorized");
    }
    const finalUserId = user.id;

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
        const pdfData = await pdfParse(buffer);
        resumeText = pdfData.text;
      } catch (err) {
        console.warn("PDF Parsing failed.", err);
        throw new Error('Failed to parse the PDF file. Please ensure it is a valid PDF and try again.');
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
  if (!user?.id) {
    return [];
  }
  const finalUserId = user.id;

  return await prisma.resume.findMany({
    where: { userId: finalUserId },
    include: { analyses: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteResume(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }
  const finalUserId = user.id;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== finalUserId) throw new Error("Not found or unauthorized");

  // Delete from storage
  await supabase.storage.from('resumes').remove([resume.filePath]);

  // Delete from db (cascade deletes analysis)
  await prisma.resume.delete({ where: { id } });

  return { success: true };
}
