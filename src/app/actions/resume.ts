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
    const accessToken = formData.get('access_token') as string | null;
    let user;
    let authError;

    if (accessToken) {
      const res = await supabase.auth.getUser(accessToken);
      user = res.data.user;
      authError = res.error;
    } else {
      const res = await supabase.auth.getUser();
      user = res.data.user;
      authError = res.error;
    }

    if (!user?.id) {
      console.log("getUser failed, trying getSession...");
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        user = session.user;
        authError = null;
      }
    }

    if (!user?.id) {
      console.error("Auth failed in resume action. User:", user, "Error:", authError);
      throw new Error("Unauthorized");
    }
    const finalUserId = user.id;

    const fileBase64 = formData.get('fileBase64') as string;
    const fileNameStr = formData.get('fileName') as string;
    const fileType = formData.get('fileType') as string;
    const jobTitle = formData.get('jobTitle') as string || 'General Role';
    const jobDescription = formData.get('jobDescription') as string || 'General Requirements';

    if (!fileBase64) {
      throw new Error('No file uploaded');
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    
    // 1. Upload to Supabase Storage
    const fileName = `${finalUserId}/${Date.now()}-${fileNameStr.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    let filePath = fileName;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, buffer, {
        contentType: fileType,
      });

    if (uploadError) {
      console.warn("Upload to Supabase failed (bucket likely missing). Proceeding without storing file physically.", uploadError);
    } else if (uploadData) {
      filePath = uploadData.path;
    }

    let resumeText = '';
    if (fileType === 'application/pdf') {
      const header = buffer.subarray(0, 5).toString('utf-8');
      if (header !== '%PDF-') {
        throw new Error(`The uploaded file is not a valid PDF (Header: ${header}). If it's a Word document, please upload it as .docx or export it properly to PDF.`);
      }
      try {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        resumeText = pdfData.text;
      } catch (err: any) {
        console.warn(`PDF Parsing failed. Buffer size: ${buffer.length}. Error:`, err);
        throw new Error(`Failed to parse PDF (${err.message || err}). Please try a different PDF file or a simpler format.`);
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
    // Ensure the user exists in Prisma DB (sync from Supabase Auth)
    await prisma.user.upsert({
      where: { id: finalUserId },
      update: {},
      create: {
        id: finalUserId,
        email: user.email || `user_${finalUserId}@example.com`,
      }
    });

    const resume = await prisma.resume.create({
      data: {
        userId: finalUserId,
        fileName: fileNameStr,
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
