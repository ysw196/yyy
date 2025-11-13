import React from 'react';
import { ImageState, ImageJob } from '../types';
import { generateImage } from '../services/geminiService';
import { LoadingSpinner } from './common/IconComponents';

interface Props {
  state: ImageState;
  setState: React.Dispatch<React.SetStateAction<ImageState>>;
}

const ImageGenerator: React.FC<Props> = ({ state, setState }) => {
  const [newPrompt, setNewPrompt] = React.useState('');

  const handleAddPrompt = () => {
      if (!newPrompt.trim()) return;
      const newJob: ImageJob = {
          prompt: newPrompt.trim(),
          imageUrl: null,
          isLoading: false,
          error: null,
      };
      setState(prev => ({ jobs: [...prev.jobs, newJob] }));
      setNewPrompt('');
  };

  const handleGenerate = async (index: number, prompt: string) => {
    if (!prompt) return;

    updateJobState(index, { isLoading: true, error: null, imageUrl: null });

    try {
      const imageUrl = await generateImage(prompt);
      updateJobState(index, { imageUrl, isLoading: false });
    } catch (err) {
      const error = err instanceof Error ? err.message : "发生未知错误";
      updateJobState(index, { error, isLoading: false });
    }
  };
  
  const handleRefine = async (index: number, prompt: string) => {
    const refinedPrompt = `${prompt}, photorealistic, high detail, cinematic lighting, 8k`;
    await handleGenerate(index, refinedPrompt);
  };

  const updateJobState = (index: number, updates: Partial<ImageJob>) => {
      setState(prevState => {
          const newJobs = [...prevState.jobs];
          newJobs[index] = { ...newJobs[index], ...updates };
          return { jobs: newJobs };
      });
  };

  const handleDownload = (imageUrl: string | null, prompt: string) => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${prompt.slice(0, 30)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleGenerateAll = () => {
    state.jobs.forEach((job, index) => {
        if (!job.imageUrl && !job.isLoading) {
            handleGenerate(index, job.prompt);
        }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
        <label htmlFor="newPrompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          添加新的配图提示词
        </label>
        <div className="mt-2 flex space-x-2">
            <input
                id="newPrompt"
                type="text"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="输入详细的图片描述..."
                className="flex-grow p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddPrompt(); }}
            />
            <button
                onClick={handleAddPrompt}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                添加
            </button>
        </div>
      </div>

      {state.jobs.length > 0 && (
            <div className="flex justify-end">
              <button
              onClick={handleGenerateAll}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  全部生成
              </button>
          </div>
      )}
      
      {state.jobs.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 pt-10 min-h-[400px] flex justify-center items-center">
                <p>从“文章生成”页传递提示词，或在上方手动添加</p>
            </div>
      )}
      
      <div className="space-y-8">
        {state.jobs.map((job, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{job.prompt}</p>

                <div className="bg-slate-100 dark:bg-slate-900 rounded-lg min-h-[300px] flex justify-center items-center">
                    {job.isLoading && (
                    <div className="text-center text-slate-500">
                        <div className="flex justify-center"><LoadingSpinner/></div>
                        <p className="mt-2">AI 正在绘制您的想法...</p>
                        <p className="text-sm mt-1">(图片生成可能需要一些时间)</p>
                    </div>
                    )}
                    {job.error && <div className="text-red-500 p-4">{job.error}</div>}
                    {!job.isLoading && job.imageUrl && (
                        <img src={job.imageUrl} alt={job.prompt} className="max-w-full max-h-[500px] rounded-lg shadow-lg" />
                    )}
                     {!job.isLoading && !job.imageUrl && !job.error && (
                        <div className="text-center text-slate-400">待生成</div>
                     )}
                </div>
                <div className="flex items-center justify-end space-x-4 mt-4">
                    <button
                        onClick={() => handleGenerate(index, job.prompt)}
                        disabled={job.isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400"
                    >
                       {job.imageUrl ? '重新生成' : '生成'}
                    </button>
                    <button
                        onClick={() => handleRefine(index, job.prompt)}
                        disabled={job.isLoading || !job.imageUrl}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                    >
                       优化
                    </button>
                    <button
                        onClick={() => handleDownload(job.imageUrl, job.prompt)}
                        disabled={!job.imageUrl}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400"
                    >
                       下载
                    </button>
                </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGenerator;