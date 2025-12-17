import { useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Edit3, Image as ImageIcon, Loader2, Send, X, Check, Upload, Sparkles, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WebsiteEditorProps {
  html: string;
  onSave: (newHtml: string) => void;
  pageType: 'home' | 'shop';
}

export default function WebsiteEditor({ html, onSave, pageType }: WebsiteEditorProps) {
  const { currentUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const setupEditableElements = () => {
    if (!isEditMode || !iframeRef.current?.contentWindow) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc || !doc.body) return;

    const existingStyle = doc.getElementById('editor-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = doc.createElement('style');
    style.id = 'editor-styles';
    style.textContent = `
      .editable-section {
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }
      .editable-section:hover::before {
        content: 'Click to edit';
        position: absolute;
        top: 8px;
        right: 8px;
        background: #2979FF;
        color: white;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(41, 121, 255, 0.4);
      }
      .editable-section:hover {
        outline: 2px solid #2979FF;
        outline-offset: 4px;
        background: rgba(41, 121, 255, 0.03);
      }
      .editable-section.selected {
        outline: 3px solid #2979FF;
        outline-offset: 4px;
        background: rgba(41, 121, 255, 0.05);
      }
      .editable-image {
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }
      .editable-image:hover::before {
        content: 'Replace image';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #06D6A0;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(6, 214, 160, 0.4);
      }
      .editable-image:hover {
        outline: 3px solid #06D6A0;
        outline-offset: 4px;
        opacity: 0.7;
        filter: brightness(0.9);
      }
    `;
    doc.head.appendChild(style);

    doc.querySelectorAll('.editable-section, .editable-image').forEach(el => {
      el.classList.remove('editable-section', 'editable-image', 'selected');
    });

    const sections = doc.querySelectorAll('section, header, nav, footer, div[class*="container"] > div, main > div, div[class*="grid"] > div');
    sections.forEach((section) => {
      section.classList.add('editable-section');

      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const element = section as HTMLElement;

        doc.querySelectorAll('.editable-section').forEach(s => s.classList.remove('selected'));
        element.classList.add('selected');

        setSelectedSection(element.outerHTML);
        setChatOpen(true);
      };

      section.removeEventListener('click', handleClick as EventListener);
      section.addEventListener('click', handleClick as EventListener);
    });

    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
      img.classList.add('editable-image');

      const handleImageClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedImageSrc(img.src);
        setShowImageUpload(true);
      };

      img.removeEventListener('click', handleImageClick as EventListener);
      img.addEventListener('click', handleImageClick as EventListener);
    });
  };

  useEffect(() => {
    if (isEditMode && iframeLoaded) {
      setupEditableElements();
    }
  }, [isEditMode, iframeLoaded]);

  useEffect(() => {
    setIframeLoaded(false);
  }, [html]);

  const handleEditSection = async () => {
    if (!selectedSection || !instruction.trim()) return;

    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/edit-website-section`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sectionHtml: selectedSection,
            instruction: instruction.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit section');
      }

      const { editedHtml } = await response.json();

      const newHtml = html.replace(selectedSection, editedHtml);
      onSave(newHtml);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setInstruction('');
      setSelectedSection(null);
      setChatOpen(false);
    } catch (err: any) {
      console.error('Error editing section:', err);
      alert(err.message || 'Failed to edit section');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedImageSrc || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('website-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('website-images')
        .getPublicUrl(filePath);

      const newHtml = html.replace(
        new RegExp(`src="${selectedImageSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
        `src="${publicUrl}"`
      );

      onSave(newHtml);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setShowImageUpload(false);
      setSelectedImageSrc(null);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      alert(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <button
          onClick={() => {
            setIsEditMode(!isEditMode);
            if (isEditMode) {
              setChatOpen(false);
              setSelectedSection(null);
            }
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg ${
            isEditMode
              ? 'bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white hover:opacity-90'
              : 'bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 hover:border-[#2979FF]/50'
          }`}
        >
          {isEditMode ? <Check size={18} /> : <Edit3 size={18} />}
          {isEditMode ? 'Done Editing' : 'Edit Website'}
        </button>

        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg px-4 py-2"
            >
              <MousePointer2 className="text-[#2979FF]" size={18} />
              <div className="text-sm">
                <p className="text-white font-medium">Click any section to edit</p>
                <p className="text-gray-400 text-xs">Text, colors, images - everything is editable</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="flex items-center gap-2 bg-[#06D6A0]/20 border border-[#06D6A0] rounded-lg px-4 py-2"
            >
              <Check className="text-[#06D6A0]" size={18} />
              <span className="text-[#06D6A0] font-medium">Changes saved!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden bg-white relative">
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] py-2 px-4 z-50 shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 text-white">
                <Sparkles size={16} />
                <span className="text-sm font-semibold">Edit Mode Active - Click any section below to make changes</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <iframe
          ref={iframeRef}
          srcDoc={html}
          className={`w-full h-[700px] transition-all ${isEditMode ? 'mt-10' : ''}`}
          title={`${pageType} Preview`}
          onLoad={() => {
            setIframeLoaded(true);
            if (isEditMode) {
              setTimeout(() => setupEditableElements(), 100);
            }
          }}
        />

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-6 right-6 w-96 bg-gradient-to-br from-[#0A192F] to-[#0F2847] border-2 border-[#2979FF] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#2979FF] to-[#06D6A0] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-white" size={20} />
                    <h3 className="text-white font-bold">AI Editor</h3>
                  </div>
                  <button
                    onClick={() => {
                      setChatOpen(false);
                      setSelectedSection(null);
                      setInstruction('');
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <p className="text-gray-400 text-xs mb-3">
                  Tell me what to change in plain English
                </p>
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Examples:&#10;• Change text to 'Welcome'&#10;• Make button green&#10;• Increase spacing"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20 resize-none h-28 text-sm"
                  disabled={isProcessing}
                  autoFocus
                />

                <button
                  onClick={handleEditSection}
                  disabled={isProcessing || !instruction.trim()}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Applying changes...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Apply Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showImageUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-[#0A192F] to-[#0F2847] border-2 border-[#06D6A0] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#06D6A0]/20 rounded-lg flex items-center justify-center">
                      <ImageIcon className="text-[#06D6A0]" size={20} />
                    </div>
                    <h3 className="text-white font-bold text-lg">Replace Image</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowImageUpload(false);
                      setSelectedImageSrc(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="mb-5">
                  <p className="text-gray-400 text-xs mb-3">Current image:</p>
                  <img
                    src={selectedImageSrc || ''}
                    alt="Current"
                    className="w-full h-48 object-cover rounded-lg border-2 border-white/10"
                  />
                </div>

                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#06D6A0]/40 bg-[#06D6A0]/5 rounded-xl cursor-pointer hover:border-[#06D6A0] hover:bg-[#06D6A0]/10 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-12 h-12 bg-[#06D6A0]/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#06D6A0]/30 transition-colors">
                      <Upload className="text-[#06D6A0] group-hover:scale-110 transition-transform" size={24} />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">
                      {uploadingImage ? 'Uploading...' : 'Click to upload new image'}
                    </p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
