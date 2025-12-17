import { useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Edit3, Image as ImageIcon, Loader2, Send, X, Check, Upload } from 'lucide-react';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isEditMode && iframeRef.current?.contentWindow) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!doc) return;

      const style = doc.createElement('style');
      style.textContent = `
        .editable-section {
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .editable-section:hover {
          outline: 2px dashed #2979FF;
          outline-offset: 4px;
        }
        .editable-section.selected {
          outline: 3px solid #2979FF;
          outline-offset: 4px;
        }
        .editable-image {
          cursor: pointer;
          transition: all 0.2s;
        }
        .editable-image:hover {
          outline: 2px dashed #06D6A0;
          outline-offset: 4px;
          opacity: 0.8;
        }
      `;
      doc.head.appendChild(style);

      const sections = doc.querySelectorAll('section, header, nav, footer, div.container > div, main > div');
      sections.forEach((section) => {
        section.classList.add('editable-section');
        section.addEventListener('click', (e) => {
          e.stopPropagation();
          const element = section as HTMLElement;

          doc.querySelectorAll('.editable-section').forEach(s => s.classList.remove('selected'));
          element.classList.add('selected');

          setSelectedSection(element.outerHTML);
          setChatOpen(true);
        });
      });

      const images = doc.querySelectorAll('img');
      images.forEach((img) => {
        img.classList.add('editable-image');
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedImageSrc(img.src);
          setShowImageUpload(true);
        });
      });
    }
  }, [isEditMode, html]);

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
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            setIsEditMode(!isEditMode);
            if (isEditMode) {
              setChatOpen(false);
              setSelectedSection(null);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isEditMode
              ? 'bg-[#2979FF] text-white'
              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
          }`}
        >
          {isEditMode ? <Check size={18} /> : <Edit3 size={18} />}
          {isEditMode ? 'Exit Edit Mode' : 'Edit Website'}
        </button>

        {isEditMode && (
          <p className="text-sm text-gray-400">
            Click any section to edit with AI or click an image to replace it
          </p>
        )}
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden bg-white relative">
        <iframe
          ref={iframeRef}
          srcDoc={html}
          className="w-full h-[700px]"
          title={`${pageType} Preview`}
        />

        {chatOpen && (
          <div className="absolute bottom-4 right-4 w-96 bg-[#0A192F] border-2 border-[#2979FF] rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit3 className="text-[#2979FF]" size={20} />
                <h3 className="text-white font-semibold">Edit Section</h3>
              </div>
              <button
                onClick={() => {
                  setChatOpen(false);
                  setSelectedSection(null);
                  setInstruction('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Tell me what you'd like to change...&#10;&#10;Examples:&#10;- Change the headline to 'Welcome to our store'&#10;- Make the button color green&#10;- Add more spacing between items"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] resize-none h-32 text-sm"
                disabled={isProcessing}
              />

              <button
                onClick={handleEditSection}
                disabled={isProcessing || !instruction.trim()}
                className="w-full mt-3 py-3 bg-[#2979FF] text-white rounded-lg font-medium hover:bg-[#2979FF]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Updating...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Update Section
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {showImageUpload && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0A192F] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <ImageIcon className="text-[#06D6A0]" size={20} />
                  Replace Image
                </h3>
                <button
                  onClick={() => {
                    setShowImageUpload(false);
                    setSelectedImageSrc(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <img
                  src={selectedImageSrc || ''}
                  alt="Current"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#06D6A0] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-400">
                    {uploadingImage ? 'Uploading...' : 'Click to upload new image'}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
