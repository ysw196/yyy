import React from 'react';
import { TopicState } from '../types';
import { generateTopics } from '../services/geminiService';
import { LoadingSpinner } from './common/IconComponents';

interface Props {
  state: TopicState;
  setState: React.Dispatch<React.SetStateAction<TopicState>>;
  onTopicSelect: (topic: string) => void;
}

const TopicGenerator: React.FC<Props> = ({ state, setState, onTopicSelect }) => {

  const handleGenerate = async () => {
    if (state.keywords.length === 0 || state.isLoading) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null, topics: [] }));
    try {
      const topics = await generateTopics(state.keywords, state.year);
      const selectableTopics = topics.map((topic, index) => ({ text: topic, selected: index === 0 }));
      setState(prev => ({ ...prev, topics: selectableTopics, isLoading: false }));
    } catch (err) {
      const error = err instanceof Error ? err.message : "发生未知错误";
      setState(prev => ({ ...prev, error, isLoading: false }));
    }
  };

  const handleSelectTopic = (index: number) => {
    const updatedTopics = state.topics.map((topic, i) => ({
      ...topic,
      selected: i === index,
    }));
    setState(prev => ({ ...prev, topics: updatedTopics }));
  };

  const handleConfirmSelection = () => {
    const selectedTopic = state.topics.find(t => t.selected);
    if (selectedTopic) {
        onTopicSelect(selectedTopic.text);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <label htmlFor="keywords" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            关键词 (用逗号分隔)
            </label>
            <div className="mt-1">
            <textarea
                id="keywords"
                name="keywords"
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                value={state.keywords.join(', ')}
                onChange={(e) => setState(prev => ({ ...prev, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }))}
                placeholder="例如：CNC加工, 精密零件, 机械制造"
            />
            </div>
        </div>
        <div>
            <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            年限 (选填)
            </label>
            <div className="mt-1">
                <input
                    type="text"
                    id="year"
                    name="year"
                    className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    placeholder="例如：2025"
                    value={state.year}
                    onChange={(e) => setState(prev => ({...prev, year: e.target.value}))}
                />
            </div>
        </div>
      </div>


      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={state.isLoading || state.keywords.length === 0}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {state.isLoading && <LoadingSpinner />}
          {state.isLoading ? '生成中...' : '生成选题'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 min-h-[200px]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">生成的选题</h3>
            {state.topics.length > 0 && (
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
            AI 正在寻找灵感...
          </div>
        )}
        {state.error && <div className="text-red-500">{state.error}</div>}
        {!state.isLoading && state.topics.length > 0 && (
          <ul className="space-y-3">
            {state.topics.map((topic, index) => (
              <li key={index} className="flex items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-md">
                <input
                  id={`topic-${index}`}
                  type="radio"
                  name="topic-selection"
                  checked={topic.selected}
                  onChange={() => handleSelectTopic(index)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor={`topic-${index}`} className="ml-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                    {topic.text}
                </label>
              </li>
            ))}
          </ul>
        )}
         {!state.isLoading && !state.error && state.topics.length === 0 && (
            <div className="text-center text-slate-400 dark:text-slate-500 pt-10">
                <p>{state.keywords.length === 0 ? '请在此处输入关键词或从上一页传递' : '结果将显示在这里'}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TopicGenerator;