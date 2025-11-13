import React from 'react';
import { KeywordState } from '../types';
import { generateLongTailKeywords } from '../services/geminiService';
import { LoadingSpinner } from './common/IconComponents';

interface Props {
  state: KeywordState;
  setState: React.Dispatch<React.SetStateAction<KeywordState>>;
  onKeywordsSelect: (keywords: string[]) => void;
}

const KeywordGenerator: React.FC<Props> = ({ state, setState, onKeywordsSelect }) => {

  const handleGenerate = async () => {
    if (!state.keyword || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, longTailKeywords: [] }));
    try {
      const keywords = await generateLongTailKeywords(state.keyword);
      const selectableKeywords = keywords.map(kw => ({ text: kw, selected: false }));
      setState(prev => ({ ...prev, longTailKeywords: selectableKeywords, isLoading: false }));
    } catch (err) {
      const error = err instanceof Error ? err.message : "发生未知错误";
      setState(prev => ({ ...prev, error, isLoading: false }));
    }
  };

  const handleToggleSelection = (index: number) => {
    const updatedKeywords = [...state.longTailKeywords];
    updatedKeywords[index].selected = !updatedKeywords[index].selected;
    setState(prev => ({ ...prev, longTailKeywords: updatedKeywords }));
  };
  
  const handleConfirmSelection = () => {
      const selected = state.longTailKeywords.filter(kw => kw.selected).map(kw => kw.text);
      if (selected.length === 0) {
          alert('请至少选择一个关键词！');
          return;
      }
      onKeywordsSelect(selected);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="keyword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          输入您的核心关键词
        </label>
        <div className="mt-1">
          <input
            id="keyword"
            name="keyword"
            type="text"
            className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            placeholder="例如：CNC加工"
            value={state.keyword}
            onChange={(e) => setState(prev => ({ ...prev, keyword: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={state.isLoading || !state.keyword}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {state.isLoading && <LoadingSpinner />}
          {state.isLoading ? '生成中...' : '生成长尾关键词'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 min-h-[200px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">生成的长尾关键词</h3>
          {state.longTailKeywords.length > 0 && (
             <button
                onClick={handleConfirmSelection}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                确认选择并传递
            </button>
          )}
        </div>

        {state.isLoading && (
          <div className="flex justify-center items-center h-full text-slate-500">
            AI 正在努力思考...
          </div>
        )}
        {state.error && <div className="text-red-500">{state.error}</div>}
        {!state.isLoading && state.longTailKeywords.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.longTailKeywords.map((kw, index) => (
              <div key={index} className="flex items-center">
                <input
                  id={`kw-${index}`}
                  type="checkbox"
                  checked={kw.selected}
                  onChange={() => handleToggleSelection(index)}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`kw-${index}`} className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                  {kw.text}
                </label>
              </div>
            ))}
          </div>
        )}
        {!state.isLoading && !state.error && state.longTailKeywords.length === 0 && (
            <div className="text-center text-slate-400 dark:text-slate-500 pt-10">
                <p>结果将显示在这里</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default KeywordGenerator;