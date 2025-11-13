import React, { useState } from 'react';
import { Page, KeywordState, TopicState, ArticleState, ImageState, AISearchState } from './types';
import KeywordGenerator from './components/KeywordGenerator';
import TopicGenerator from './components/TopicGenerator';
import AISearch from './components/AISearch';
import ArticleGenerator from './components/ArticleGenerator';
import ImageGenerator from './components/ImageGenerator';
import { KeyIcon, LightbulbIcon, DocumentTextIcon, PhotographIcon, SearchBrainIcon } from './components/common/IconComponents';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.Keyword);

  const [keywordState, setKeywordState] = useState<KeywordState>({
    keyword: '',
    longTailKeywords: [],
    isLoading: false,
    error: null,
  });

  const [topicState, setTopicState] = useState<TopicState>({
    keywords: [],
    year: new Date().getFullYear().toString(),
    topics: [],
    isLoading: false,
    error: null,
  });

  const [aiSearchState, setAiSearchState] = useState<AISearchState>({
    topic: '',
    region: '中国',
    analysisResult: '',
    isLoading: false,
    error: null,
  });

  const [articleState, setArticleState] = useState<ArticleState>({
    title: '',
    article: '',
    isLoading: false,
    error: null,
    articleType: 'GEO',
    wordCount: '1500',
    language: '中文',
    companyName: '伟迈特cnc加工',
    contentToInsert: '',
    outline: '',
    imagePrompts: [],
    useKnowledgeBase: true,
  });

  const [imageState, setImageState] = useState<ImageState>({
    jobs: [],
  });
  
  const handleKeywordsSelect = (keywords: string[]) => {
      setTopicState(prev => ({ ...prev, keywords }));
      setActivePage(Page.Topic);
  };
  
  const handleTopicSelect = (topic: string) => {
      // Update state for the next step (AI Search)
      setAiSearchState(prev => ({ ...prev, topic: topic, analysisResult: '' }));
      // Also update the final destination (Article Generator) with the new topic.
      // Reset the analysis content since it's now outdated for the new topic.
      setArticleState(prev => ({ ...prev, title: topic, contentToInsert: '' }));
      // Navigate to the next step in the workflow
      setActivePage(Page.AISearch);
  };

  const handleAnalysisComplete = (analysis: string) => {
    setArticleState(prev => ({
        ...prev,
        title: aiSearchState.topic, // Ensure title consistency
        contentToInsert: analysis,
    }));
    setActivePage(Page.Article);
  };

  const handlePromptsGenerated = (prompts: string[]) => {
      const newJobs = prompts.map(prompt => ({
          prompt,
          imageUrl: null,
          isLoading: false,
          error: null,
      }));
      setImageState({ jobs: newJobs });
      setActivePage(Page.Image);
  };

  const pageConfig = [
    { id: Page.Keyword, label: '关键词生成', icon: <KeyIcon /> },
    { id: Page.Topic, label: '选题生成', icon: <LightbulbIcon /> },
    { id: Page.AISearch, label: 'AI搜索分析', icon: <SearchBrainIcon /> },
    { id: Page.Article, label: '文章生成', icon: <DocumentTextIcon /> },
    { id: Page.Image, label: '配图生成', icon: <PhotographIcon /> },
  ];

  const renderActivePage = () => {
    switch (activePage) {
      case Page.Keyword:
        return <KeywordGenerator state={keywordState} setState={setKeywordState} onKeywordsSelect={handleKeywordsSelect} />;
      case Page.Topic:
        return <TopicGenerator state={topicState} setState={setTopicState} onTopicSelect={handleTopicSelect} />;
      case Page.AISearch:
        return <AISearch state={aiSearchState} setState={setAiSearchState} onAnalysisComplete={handleAnalysisComplete} />;
      case Page.Article:
        return <ArticleGenerator state={articleState} setState={setArticleState} onPromptsGenerated={handlePromptsGenerated} />;
      case Page.Image:
        return <ImageGenerator state={imageState} setState={setImageState} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">AI 内容创作助手</h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">一站式解决您的内容创作需求</p>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 mb-8 sticky top-2 z-10">
          <nav className="flex flex-wrap justify-center space-x-1 sm:space-x-2">
            {pageConfig.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`flex items-center justify-center px-3 py-2 my-1 text-sm sm:text-base font-medium rounded-md transition-colors duration-200 ease-in-out w-full sm:w-auto flex-1 sm:flex-none ${
                  activePage === id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <main>
          <div className="bg-transparent rounded-lg p-0 sm:p-0">
            {renderActivePage()}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
            <p>由 Gemini API 强力驱动</p>
        </footer>
      </div>
    </div>
  );
};

export default App;