import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Page } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = React.useState<Page | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'pages'), 
          where('slug', '==', slug),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPage({ id: snap.docs[0].id, ...snap.docs[0].data() } as Page);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
      </div>
    );
  }

  if (!page) {
    return <Navigate to="/" />;
  }

  return (
    <div className="pb-20">
      {page.sections.map((section, i) => (
        <section key={section.id || i} className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            {section.type === 'hero' && (
              <div className="relative h-[600px] rounded-[2rem] overflow-hidden flex items-center justify-center text-center text-white">
                {section.content.image && (
                  <img src={section.content.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 max-w-3xl px-6">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
                  >
                    {section.content.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-200"
                  >
                    {section.content.text}
                  </motion.p>
                </div>
              </div>
            )}

            {section.type === 'image-with-text' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="aspect-square rounded-[2rem] overflow-hidden bg-gray-100"
                >
                  {section.content.image && (
                    <img src={section.content.image} alt="" className="h-full w-full object-cover" />
                  )}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-4xl font-bold text-black tracking-tight">{section.content.title}</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">{section.content.text}</p>
                </motion.div>
              </div>
            )}

            {section.type === 'rich-text' && (
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-black tracking-tight"
                >
                  {section.content.title}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-gray-600 leading-relaxed"
                >
                  {section.content.text}
                </motion.p>
              </div>
            )}

            {section.type === 'featured-collection' && (
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold text-black tracking-tight">{section.content.title}</h2>
                  <p className="text-lg text-gray-600">{section.content.text}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-4 group cursor-pointer">
                      <div className="aspect-[3/4] rounded-2xl bg-gray-100 overflow-hidden relative">
                        <img src={`https://picsum.photos/seed/${i + 10}/600/800`} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-black">Product {i}</h3>
                        <p className="text-gray-500">$99.00</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section.type === 'newsletter' && (
              <div className="max-w-4xl mx-auto rounded-[3rem] bg-black p-12 md:p-20 text-center text-white space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{section.content.title}</h2>
                  <p className="text-xl text-gray-400">{section.content.text}</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                  <input type="email" placeholder="Enter your email" className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-white" />
                  <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors">Subscribe</button>
                </div>
              </div>
            )}

            {section.type === 'gallery' && (
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold text-black tracking-tight">{section.content.title}</h2>
                  <p className="text-lg text-gray-600">{section.content.text}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className={cn(
                      "aspect-square rounded-2xl overflow-hidden bg-gray-100",
                      i === 1 && "md:col-span-2 md:row-span-2 md:aspect-auto"
                    )}>
                      <img src={`https://picsum.photos/seed/gallery-${i}/800/800`} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
};
