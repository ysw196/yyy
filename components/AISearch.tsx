import React from 'react';
import { AISearchState } from '../types';
import { analyzeTopicWithAISearch, optimizeAnalysis } from '../services/geminiService';
import { LoadingSpinner } from './common/IconComponents';

interface Props {
  state: AISearchState;
  setState: React.Dispatch<React.SetStateAction<AISearchState>>;
  onAnalysisComplete: (analysis: string) => void;
}

const AISearch: React.FC<Props> = ({ state, setState, onAnalysisComplete }) => {
  const [optimizing, setOptimizing] = React.useState(false);
  const [optimizationDirection, setOptimizationDirection] = React.useState('更侧重技术深度');
  const [customDirection, setCustomDirection] = React.useState('');

  const optimizationOptions = ['更侧重技术深度', '更侧重商业价值', '更侧重成本效益', '自定义...'];

  const handleAnalyze = async () => {
    if (!state.topic || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, analysisResult: '' }));
    try {
      const result = await analyzeTopicWithAISearch(state.topic, state.region);
      setState(prev => ({ ...prev, analysisResult: result, isLoading: false }));
    } catch (err) {
      const error = err instanceof Error ? err.message : "发生未知错误";
      setState(prev => ({ ...prev, error, isLoading: false }));
    }
  };

  const handleOptimize = async () => {
      const direction = optimizationDirection === '自定义...' ? customDirection : optimizationDirection;
      if (!direction || !state.analysisResult || optimizing) return;

      setOptimizing(true);
      setState(prev => ({ ...prev, error: null }));
      try {
          const result = await optimizeAnalysis(state.analysisResult, state.topic, direction);
          setState(prev => ({ ...prev, analysisResult: result }));
      } catch (err) {
          const error = err instanceof Error ? err.message : "优化时发生错误";
          setState(prev => ({ ...prev, error }));
      } finally {
          setOptimizing(false);
      }
  };
  
  const handleConfirm = () => {
      onAnalysisComplete(state.analysisResult);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            输入您要分析的选题
            </label>
            <div className="mt-1">
            <input
                id="topic"
                name="topic"
                type="text"
                className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                value={state.topic}
                onChange={(e) => setState(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="例如：2025年CNC加工厂家哪家好"
            />
            </div>
        </div>
        <div>
            <label htmlFor="region" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            AI搜索区域
            </label>
            <div className="mt-1">
                <select 
                    id="region"
                    value={state.region} 
                    onChange={e => setState(p => ({...p, region: e.target.value as '中国' | '国外'}))} 
                    className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                >
                    <option value="中国">中国</option>
                    <option value="国外">国外</option>
                </select>
            </div>
        </div>
      </div>


      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={state.isLoading || !state.topic}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {state.isLoading && <LoadingSpinner />}
          {state.isLoading ? '分析中...' : '开始AI搜索分析'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">AI搜索分析结果</h3>
            {state.analysisResult && !state.isLoading && (
                <button
                    onClick={handleConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    使用此分析撰写文章
                </button>
            )}
        </div>
        {state.isLoading && (
          <div className="flex justify-center items-center h-full text-slate-500">
            AI 正在模拟搜索并提炼要点...
          </div>
        )}
        {state.error && <div className="text-red-500">{state.error}</div>}
        {!state.isLoading && state.analysisResult && (
          <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap">
            {state.analysisResult}
          </div>
        )}
         {!state.isLoading && !state.error && !state.analysisResult && (
            <div className="text-center text-slate-400 dark:text-slate-500 pt-10">
                <p>{!state.topic ? '请输入一个选题进行分析' : '分析结果将显示在这里'}</p>
            </div>
        )}
      </div>
      
      {!state.isLoading && state.analysisResult && (
        <div className="bg-slate-100 dark:bg-slate-700/50 shadow-md rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">优化分析结果</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">根据特定方向，对以上分析报告进行深化和重写。</p>
            <fieldset className="space-y-2">
                <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300">选择优化方向:</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {optimizationOptions.map(option => (
                        <div key={option} className="flex items-center">
                            <input
                                id={option}
                                name="optimization-direction"
                                type="radio"
                                checked={optimizationDirection === option}
                                onChange={() => setOptimizationDirection(option)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <label htmlFor={option} className="ml-2 block text-sm text-slate-800 dark:text-slate-200">{option}</label>
                        </div>
                    ))}
                </div>
            </fieldset>

            {optimizationDirection === '自定义...' && (
                 <input
                    type="text"
                    value={customDirection}
                    onChange={(e) => setCustomDirection(e.target.value)}
                    placeholder="请输入您的自定义优化方向"
                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                />
            )}
             <div className="flex justify-end">
                <button
                onClick={handleOptimize}
                disabled={optimizing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400"
                >
                {optimizing && <LoadingSpinner />}
                {optimizing ? '优化中...' : '开始优化'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AISearch;