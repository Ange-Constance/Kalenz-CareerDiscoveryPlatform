import AppLayout from '../components/Layout/AppLayout';
import CVUploadSection from '../components/upload/CVUploadSection';

export default function Upload() {
  return (
    <AppLayout>
      <div className="w-full">
        <h1 className="page-title text-white">Upload Your CV</h1>
        <p className="page-subtitle mb-8">
          Upload a PDF or Word document (.docx). Max 5MB. We analyze skills and discard the file.
        </p>
        <CVUploadSection compact={false} showResultsLink />
      </div>
    </AppLayout>
  );
}
