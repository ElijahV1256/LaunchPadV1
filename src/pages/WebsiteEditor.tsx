import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Save, X, Eye, Code, Type, Image as ImageIcon, Palette, Undo, Redo } from 'lucide-react';

export default function WebsiteEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const websiteId = searchParams.get('id');

  const [homeHtml, setHomeHtml] = useState('');
  const [shopHtml, setShopHtml] = useState('');
  const [originalHomeHtml, setOriginalHomeHtml] = useState('');
  const [originalShopHtml, setOriginalShopHtml] = useState('');
  const [activePage, setActivePage] = useState<'home' | 'shop'>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [hasChanges, setHasChanges] = useState(false);
  const [history, setHistory] = useState<{ home: string; shop: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = activePage === 'home' ? homeHtml : shopHtml;

  useEffect(() => {
    if (websiteId) {
      loadWebsite();
    }
  }, [websiteId]);

  const loadWebsite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('starter_websites')
        .select('home_html, shop_html')
        .eq('id', websiteId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        alert('Website not found');
        navigate('/website');
        return;
      }

      const home = data.home_html || '';
      const shop = data.shop_html || '';
      setHomeHtml(home);
      setShopHtml(shop);
      setOriginalHomeHtml(home);
      setOriginalShopHtml(shop);
      setHistory([{ home, shop }]);
      setHistoryIndex(0);
    } catch (error) {
      console.error('Error loading website:', error);
      alert('Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const saveWebsite = async () => {
    if (!websiteId) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('starter_websites')
        .update({
          home_html: homeHtml,
          shop_html: shopHtml
        })
        .eq('id', websiteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setOriginalHomeHtml(homeHtml);
      setOriginalShopHtml(shopHtml);
      setHasChanges(false);
      alert('Website saved successfully!');
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Failed to save website');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (newHtml: string) => {
    if (activePage === 'home') {
      setHomeHtml(newHtml);
    } else {
      setShopHtml(newHtml);
    }

    const hasHomeChanges = (activePage === 'home' ? newHtml : homeHtml) !== originalHomeHtml;
    const hasShopChanges = (activePage === 'shop' ? newHtml : shopHtml) !== originalShopHtml;
    setHasChanges(hasHomeChanges || hasShopChanges);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      home: activePage === 'home' ? newHtml : homeHtml,
      shop: activePage === 'shop' ? newHtml : shopHtml
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHomeHtml(history[newIndex].home);
      setShopHtml(history[newIndex].shop);

      const hasHomeChanges = history[newIndex].home !== originalHomeHtml;
      const hasShopChanges = history[newIndex].shop !== originalShopHtml;
      setHasChanges(hasHomeChanges || hasShopChanges);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setHomeHtml(history[newIndex].home);
      setShopHtml(history[newIndex].shop);

      const hasHomeChanges = history[newIndex].home !== originalHomeHtml;
      const hasShopChanges = history[newIndex].shop !== originalShopHtml;
      setHasChanges(hasHomeChanges || hasShopChanges);
    }
  };

  useEffect(() => {
    if (viewMode === 'preview' && iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        setTimeout(() => {
          makeElementsEditable(doc);
        }, 500);
      }
    }
  }, [htmlContent, viewMode]);

  const makeElementsEditable = (doc: Document) => {
    const editableSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, button, li';
    const elements = doc.querySelectorAll(editableSelectors);

    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;

      if (htmlElement.querySelector('img')) {
        return;
      }

      htmlElement.style.cursor = 'pointer';
      htmlElement.style.outline = '2px solid transparent';
      htmlElement.style.transition = 'outline 0.2s';

      htmlElement.addEventListener('mouseenter', () => {
        htmlElement.style.outline = '2px solid #3b82f6';
      });

      htmlElement.addEventListener('mouseleave', () => {
        if (!htmlElement.isContentEditable || htmlElement.contentEditable === 'false') {
          htmlElement.style.outline = '2px solid transparent';
        }
      });

      htmlElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (htmlElement.contentEditable === 'true') {
          return;
        }

        doc.querySelectorAll('[contenteditable="true"]').forEach((el) => {
          (el as HTMLElement).contentEditable = 'false';
          (el as HTMLElement).style.outline = '2px solid transparent';
        });

        htmlElement.contentEditable = 'true';
        htmlElement.style.outline = '2px solid #10b981';
        htmlElement.focus();

        const range = doc.createRange();
        const selection = doc.getSelection();
        range.selectNodeContents(htmlElement);
        selection?.removeAllRanges();
        selection?.addRange(range);
      });

      htmlElement.addEventListener('blur', () => {
        htmlElement.contentEditable = 'false';
        htmlElement.style.outline = '2px solid transparent';

        if (doc.documentElement) {
          updateContent(doc.documentElement.outerHTML);
        }
      });

      htmlElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          htmlElement.blur();
        }
      });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (hasChanges && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                    return;
                  }
                  navigate('/website');
                }}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
                <span className="font-medium">Close Editor</span>
              </button>

              <div className="h-6 w-px bg-slate-300"></div>

              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Undo"
                >
                  <Undo className="w-5 h-5" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Redo"
                >
                  <Redo className="w-5 h-5" />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-300"></div>

              <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Preview</span>
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'code'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span className="text-sm font-medium">Code</span>
                </button>
              </div>

              <div className="h-6 w-px bg-slate-300"></div>

              <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setActivePage('home')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activePage === 'home'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActivePage('shop')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activePage === 'shop'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Shop
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
              )}
              <button
                onClick={saveWebsite}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-4 h-4" />
                <span className="font-medium">{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {viewMode === 'preview' ? (
          <div className="flex-1 bg-white">
            <div className="h-full">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Website Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4">
            <div className="max-w-[1400px] mx-auto">
              <textarea
                value={htmlContent}
                onChange={(e) => updateContent(e.target.value)}
                className="w-full h-[calc(100vh-200px)] p-4 font-mono text-sm bg-slate-900 text-slate-100 rounded-lg border border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>

      {viewMode === 'preview' && (
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-3">
          <div className="max-w-[1800px] mx-auto">
            <p className="text-sm text-slate-600 text-center">
              <Type className="w-4 h-4 inline mr-1" />
              Click on any text to edit it. Press Enter to save changes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
