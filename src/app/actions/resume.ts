'use server'

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/sync-user';
import { analyzeResume } from '@/lib/ai/gemini';

import { extractTextFromPdf } from '@/lib/pdf/parser';

export async function uploadAndAnalyzeResume(formData: FormData) {
  let uploadedFilePath: string | null = null;
  const supabase = await createClient();

  try {
    const accessToken = formData.get('access_token') as string | null;
    const auth = await getAuthenticatedUser(accessToken);

    if (!auth) {
      throw new Error("Unauthorized");
    }
    const finalUserId = auth.dbUser.id;

    const fileBase64 = formData.get('fileBase64') as string;
    const fileNameStr = formData.get('fileName') as string;
    const fileType = formData.get('fileType') as string;
    const jobTitle = (formData.get('jobTitle') as string) || 'General Role';
    const jobDescription = (formData.get('jobDescription') as string) || 'General Requirements';

    if (!fileBase64) {
      throw new Error('No file uploaded');
    }

    const buffer = Buffer.from(fileBase64, 'base64');

    // Enforce 5MB upload limit to prevent resource exhaustion
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('File exceeds the 5MB size limit. Please upload a smaller PDF or text file.');
    }

    // 1. Validate and extract text before attempting storage upload
    let resumeText = '';
    if (fileType === 'application/pdf') {
      resumeText = await extractTextFromPdf(buffer);
    } else {
      resumeText = buffer.toString('utf-8');
    }

    if (!resumeText || resumeText.trim() === '') {
      throw new Error('Could not extract text from the resume');
    }

    // 2. Upload to Supabase Storage with authenticated user ownership path
    const sanitizedFileName = fileNameStr.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${finalUserId}/${Date.now()}-${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, buffer, {
        contentType: fileType,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error("Storage upload failed:", uploadError?.message);
      throw new Error(`Resume storage failed: ${uploadError?.message || 'Bucket unavailable'}. Please verify the 'resumes' storage bucket is created.`);
    }

    uploadedFilePath = uploadData.path;

    // 3. AI Analysis (with safety handling)
    let analysisResult;
    try {
      analysisResult = await analyzeResume(resumeText, jobTitle, jobDescription);
    } catch (aiErr: unknown) {
      // Compensating storage cleanup if analysis fails completely
      if (uploadedFilePath) {
        await supabase.storage.from('resumes').remove([uploadedFilePath]).catch(() => {});
        uploadedFilePath = null;
      }
      throw aiErr;
    }

    // 4. Save to Database
    try {
      const resume = await prisma.resume.create({
        data: {
          userId: finalUserId,
          fileName: fileNameStr,
          filePath: uploadedFilePath,
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
    } catch (dbErr: unknown) {
      // Compensating cleanup of uploaded file if database insert fails
      if (uploadedFilePath) {
        console.warn("Database insert failed. Executing compensating storage cleanup for:", uploadedFilePath);
        await supabase.storage.from('resumes').remove([uploadedFilePath]).catch(() => {});
      }
      throw dbErr;
    }

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Resume processing error:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function getUserResumes() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return [];
  }

  return await prisma.resume.findMany({
    where: { userId: auth.dbUser.id },
    include: { analyses: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteResume(id: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return { success: false, error: "Unauthorized" };
  }
  const finalUserId = auth.dbUser.id;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) {
    return { success: false, error: "Resume not found" };
  }
  if (resume.userId !== finalUserId) {
    return { success: false, error: "Forbidden: You do not own this resume" };
  }

  // Attempt storage file removal
  const supabase = await createClient();
  const { error: storageError } = await supabase.storage.from('resumes').remove([resume.filePath]);
  if (storageError) {
    console.warn(`Storage file removal notice: ${resume.filePath} could not be deleted from storage:`, storageError.message);
  }

  // Delete from db (cascade deletes analysis)
  await prisma.resume.delete({ where: { id } });

  return { success: true };
}

export async function getResumeDownloadUrl(id: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return { success: false, error: "Unauthorized" };
  }

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) {
    return { success: false, error: "Resume not found" };
  }
  if (resume.userId !== auth.dbUser.id) {
    return { success: false, error: "Forbidden: You do not own this resume" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('resumes')
    .createSignedUrl(resume.filePath, 300); // 5-minute temporary link

  if (error || !data?.signedUrl) {
    return { success: false, error: error?.message || "Failed to generate secure download URL" };
  }

  return { success: true, url: data.signedUrl };
}

