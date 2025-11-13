import React from 'react';
import { ArticleState } from '../types';
import { generateArticle } from '../services/geminiService';
import { LoadingSpinner } from './common/IconComponents';

interface Props {
  state: ArticleState;
  setState: React.Dispatch<React.SetStateAction<ArticleState>>;
  onPromptsGenerated: (prompts: string[]) => void;
}

const ArticleGenerator: React.FC<Props> = ({ state, setState, onPromptsGenerated }) => {

  const handleGenerate = async () => {
    if (!state.title || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, article: '', imagePrompts: [] }));

    try {
      const article = await generateArticle({
          title: state.title,
          type: state.articleType,
          wordCount: state.wordCount,
          language: state.language,
          companyName: state.companyName,
          contentToInsert: state.contentToInsert,
          outline: state.outline,
          useKnowledgeBase: state.useKnowledgeBase,
      });

      // 从生成的文章中提取配图提示词
      const promptRegex = /\[配图提示词：(.*?)\]/g;
      const prompts: string[] = [];
      let match;
      while ((match = promptRegex.exec(article)) !== null) {
          prompts.push(match[1].trim());
      }

      setState(prev => ({ ...prev, article, imagePrompts: prompts, isLoading: false }));
    } catch (err) {
      const error = err instanceof Error ? err.message : "发生未知错误";
      setState(prev => ({ ...prev, error, isLoading: false }));
    }
  };
  
  const handleConfirmPrompts = () => {
      onPromptsGenerated(state.imagePrompts);
  };

  const renderArticleContent = (text: string) => {
    // Remove image prompt tags from the rendered output
    const textToRender = text.replace(/\[配图提示词：.*?\]/g, '').trim();
    
    // Split text into blocks by one or more newlines
    const blocks = textToRender.split(/\n\s*\n/).filter(Boolean);

    return blocks.map((block, index) => {
        // Check if the block is a custom heading
        const hMatch = block.match(/^\[H([1-3])\](.*?)\[\/H\1\]$/s);
        if (hMatch) {
            const level = hMatch[1];
            const content = hMatch[2].trim();
            if (level === '1') return <h1 key={index} className="text-3xl font-extrabold mt-8 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">{content}</h1>;
            if (level === '2') return <h2 key={index} className="text-2xl font-bold mt-10 mb-3 text-indigo-700 dark:text-indigo-400">{content}</h2>;
            if (level === '3') return <h3 key={index} className="text-xl font-semibold mt-6 mb-2 text-slate-800 dark:text-slate-200">{content}</h3>;
        }

        // Check if the block is a markdown table
        const lines = block.trim().split('\n');
        const isTable = lines.length > 1 &&
                        lines.every(line => line.trim().startsWith('|') && line.trim().endsWith('|')) &&
                        lines[1].includes('---');

        if (isTable) {
            try {
                const headers = lines[0].split('|').slice(1, -1).map(h => h.trim());
                const rows = lines.slice(2).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
                
                // Basic validation to ensure it's a real table
                if (headers.length === 0 || rows.some(r => r.length !== headers.length)) {
                    throw new Error("Mismatched columns in table");
                }

                return (
                    <div key={`table-wrapper-${index}`} className="my-6 overflow-x-auto shadow-md rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-100 dark:bg-slate-700">
                                <tr>
                                    {headers.map((header, i) => <th key={i} scope="col" className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{header}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {rows.map((row, i) => (
                                    <tr key={i} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors duration-150 ease-in-out">
                                        {row.map((cell, j) => <td key={j} className="px-6 py-4 whitespace-normal text-sm text-slate-600 dark:text-slate-300">{cell}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            } catch (e) {
                // If table parsing fails, render as a preformatted block
                return <p key={`p-err-${index}`} className="mb-5 leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{block}</p>;
            }
        }
        
        // Otherwise, render as a paragraph
        return <p key={`p-${index}`} className="mb-5 leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{block}</p>;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          文章标题
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="title"
            name="title"
            className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            value={state.title}
            onChange={e => setState(p => ({...p, title: e.target.value}))}
            placeholder="在此处输入文章标题"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">文章类型</label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <button onClick={() => setState(p => ({...p, articleType: 'GEO', useKnowledgeBase: true}))} className={`px-4 py-2 text-sm w-1/2 rounded-l-md ${state.articleType === 'GEO' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800'}`}>GEO文章</button>
                <button onClick={() => setState(p => ({...p, articleType: 'SEO', useKnowledgeBase: false}))} className={`px-4 py-2 text-sm w-1/2 rounded-r-md ${state.articleType === 'SEO' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800'}`}>SEO文章</button>
            </div>
        </div>
        <div>
            <label htmlFor="wordCount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">字数</label>
            <input id="wordCount" type="text" value={state.wordCount} onChange={e => setState(p => ({...p, wordCount: e.target.value}))} placeholder="默认1500" className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
        </div>
        <div>
            <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300">内容语言</label>
            <select id="language" value={state.language} onChange={e => setState(p => ({...p, language: e.target.value as '中文' | 'English'}))} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                <option>中文</option>
                <option>English</option>
            </select>
        </div>
        <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">公司名称</label>
            <input id="companyName" type="text" value={state.companyName} onChange={e => setState(p => ({...p, companyName: e.target.value}))} placeholder="伟迈特cnc加工" className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
        </div>
      </div>

      {state.articleType === 'GEO' && (
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-md">
              <div className="flex items-center">
                  <input
                      id="useKnowledgeBase"
                      type="checkbox"
                      checked={state.useKnowledgeBase}
                      onChange={e => setState(p => ({...p, useKnowledgeBase: e.target.checked}))}
                      className="h-5 w-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="useKnowledgeBase" className="ml-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                      使用公司知识库作为参考
                  </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 ml-8">
                  启用后，AI将自动调用预设的公司背景、优势、技术实力等资料来丰富文章内容，使其更具说服力和专业性。
              </p>
          </div>
      )}
      
      <div>
        <label htmlFor="contentToInsert" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            内容插入选择 (来自AI搜索分析)
        </label>
        <textarea id="contentToInsert" rows={4} value={state.contentToInsert} onChange={e => setState(p => ({...p, contentToInsert: e.target.value}))} className="mt-1 w-full p-3 border border-slate-300 rounded-md shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="AI分析的核心内容将自动填充在此处，AI将分析并改写这些要点，然后融入生成的文章中。"></textarea>
      </div>

      <div>
        <label htmlFor="outline" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          文章大纲 (选填)
        </label>
        <textarea 
            id="outline" 
            rows={6} 
            value={state.outline} 
            onChange={e => setState(p => ({...p, outline: e.target.value}))} 
            className="mt-1 w-full p-3 border border-slate-300 rounded-md shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" 
            placeholder="（选填）输入您的文章大纲，AI将严格遵循此结构。请将AI搜索分析的内容视为素材，填充到这个大纲框架中。例如：&#10;1. 引言：介绍[地名]CNC加工厂家的现状&#10;2. 核心优势：[公司名]的技术实力&#10;   - 五轴加工能力&#10;   - 材料处理经验&#10;3. 案例分析&#10;4. 结论"></textarea>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={state.isLoading || !state.title}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {state.isLoading && <LoadingSpinner />}
          {state.isLoading ? '生成中...' : '生成文章'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 min-h-[400px]">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">生成的文章</h3>
        {state.isLoading && (
          <div className="flex justify-center items-center h-full text-slate-500">
            AI 正在奋笔疾书...
          </div>
        )}
        {state.error && <div className="text-red-500">{state.error}</div>}
        {!state.isLoading && state.article && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
            <div className="max-w-none">
              {renderArticleContent(state.article)}
            </div>
          </div>
        )}
        {!state.isLoading && !state.error && !state.article && (
            <div className="text-center text-slate-400 dark:text-slate-500 pt-10">
                <p>{state.title ? '结果将显示在这里' : '请输入标题以生成文章'}</p>
            </div>
        )}
      </div>

      {state.imagePrompts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">从文章中提取的配图提示词</h3>
                <button
                    onClick={handleConfirmPrompts}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    使用这些提示词生成配图
                </button>
            </div>
            <div className="space-y-3">
                {state.imagePrompts.map((prompt, index) => (
                    <div key={index} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-300">
                        {prompt}
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ArticleGenerator;