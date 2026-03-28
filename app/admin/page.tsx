'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [formData, setFormData] = useState({
    word: '', phonetic: '', meaning_en: '', meaning_hi: '',
    example_en: '', example_hi: '', synonyms: '', antonyms: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  
  // Basic security: require email/password login to view the form
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setStatus('Login failed: ' + error.message);
    else setSession(data.session);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Uploading...');

    let imageUrl = '';
    
    // 1. Upload Image to Storage if it exists
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.word.toLowerCase()}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('word-images').upload(fileName, file);
      
      if (uploadError) return setStatus('Image upload failed: ' + uploadError.message);
      
      const { data: publicUrlData } = supabase.storage.from('word-images').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    // 2. Insert Data into Database
    const { error: insertError } = await supabase.from('words').insert([{
      word: formData.word,
      phonetic: formData.phonetic,
      image_url: imageUrl || null,
      meaning_en: formData.meaning_en,
      meaning_hi: formData.meaning_hi,
      example_en: formData.example_en,
      example_hi: formData.example_hi,
      synonyms: formData.synonyms.split(',').map(s => s.trim()).filter(Boolean),
      antonyms: formData.antonyms.split(',').map(s => s.trim()).filter(Boolean),
    }]);

    if (insertError) {
      setStatus('Database error: ' + insertError.message);
    } else {
      setStatus('Word added successfully!');
      setFormData({ word: '', phonetic: '', meaning_en: '', meaning_hi: '', example_en: '', example_hi: '', synonyms: '', antonyms: '' });
      setFile(null);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md flex flex-col gap-4 w-96">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded" />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
          <p className="text-red-500 text-sm">{status}</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-serif font-bold mb-8">Add New Word</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Word (e.g., Abhor)" value={formData.word} onChange={e => setFormData({...formData, word: e.target.value})} className="border p-3 rounded" />
            <input placeholder="Phonetic (e.g., ab-HAWR)" value={formData.phonetic} onChange={e => setFormData({...formData, phonetic: e.target.value})} className="border p-3 rounded" />
          </div>
          
          <div className="border-2 border-dashed border-gray-300 p-6 rounded text-center">
            <label className="block text-gray-600 font-medium mb-2">Upload Illustration (.webp)</label>
            <input type="file" accept="image/webp, image/jpeg, image/png" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>

          <textarea required placeholder="Meaning (English)" value={formData.meaning_en} onChange={e => setFormData({...formData, meaning_en: e.target.value})} className="border p-3 rounded h-24" />
          <textarea required placeholder="Meaning (Hindi)" value={formData.meaning_hi} onChange={e => setFormData({...formData, meaning_hi: e.target.value})} className="border p-3 rounded h-24 font-hindi" />
          
          <input placeholder="Example (English) - Use <strong>word</strong> for bolding" value={formData.example_en} onChange={e => setFormData({...formData, example_en: e.target.value})} className="border p-3 rounded" />
          <input placeholder="Example (Hindi) - Use <strong>word</strong> for bolding" value={formData.example_hi} onChange={e => setFormData({...formData, example_hi: e.target.value})} className="border p-3 rounded font-hindi" />
          
          <input placeholder="Synonyms (comma separated)" value={formData.synonyms} onChange={e => setFormData({...formData, synonyms: e.target.value})} className="border p-3 rounded" />
          <input placeholder="Antonyms (comma separated)" value={formData.antonyms} onChange={e => setFormData({...formData, antonyms: e.target.value})} className="border p-3 rounded" />

          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded mt-4 transition-colors">Add to Database</button>
          
          {status && <div className="mt-4 p-4 rounded bg-gray-100 font-medium text-center">{status}</div>}
        </form>
      </div>
    </div>
  );
}