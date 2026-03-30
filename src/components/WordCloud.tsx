import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { motion, AnimatePresence } from 'motion/react';

const KEYWORDS = [
  { text: 'Wireless Communications', size: 60 },
  { text: 'Blockchain', size: 55 },
  { text: 'Generative AI', size: 50 },
  { text: 'IoT Systems', size: 48 },
  { text: 'Data Science', size: 45 },
  { text: 'Network Security', size: 42 },
  { text: 'Cloud Computing', size: 40 },
  { text: 'Machine Learning', size: 38 },
  { text: 'Pervasive Networks', size: 35 },
  { text: '5G/6G', size: 32 },
  { text: 'Edge Computing', size: 30 },
  { text: 'Smart Cities', size: 28 },
  { text: 'Cybersecurity', size: 26 },
  { text: 'Deep Learning', size: 24 },
  { text: 'Distributed Systems', size: 22 },
  { text: 'Cognitive Radio', size: 20 },
  { text: 'SDN', size: 18 },
  { text: 'NFV', size: 16 },
  { text: 'Big Data', size: 14 },
  { text: 'WSN', size: 12 },
  { text: 'V2X', size: 10 },
  { text: 'UAV Networks', size: 10 },
  { text: 'Quantum Computing', size: 8 },
  { text: 'Digital Twins', size: 8 },
  { text: 'Federated Learning', size: 8 },
  { text: 'Web3', size: 8 },
  { text: 'DeFi', size: 8 },
  { text: 'Smart Contracts', size: 8 },
  { text: 'NLP', size: 8 },
  { text: 'Computer Vision', size: 8 },
];

const COLORS = [
  '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', 
  '#fb7185', '#38bdf8', '#22d3ee', '#2dd4bf', '#34d399'
];

export default function WordCloud() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width,
          height: Math.min(width * 0.6, 600)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0) return;

    const generateCloud = async () => {
      await document.fonts.ready;

      const layout = cloud()
        .size([dimensions.width, dimensions.height])
        .words(KEYWORDS.map(d => ({ ...d })))
        .padding(10)
        .rotate(() => (Math.random() > 0.5 ? 0 : 90))
        .font('Inter')
        .fontSize(d => {
          const scale = dimensions.width / 1000;
          return Math.max(12, (d.size || 10) * scale * 1.5);
        })
        .on('end', (computedWords) => {
          setWords(computedWords);
        });

      layout.start();
    };

    generateCloud();
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full relative py-24 mt-12 border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent blur-3xl -z-10" />
      
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Research Domain Cloud</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">A visual representation of core research areas, technologies, and academic focus points.</p>
      </div>

      <div 
        className="relative mx-auto overflow-hidden"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <AnimatePresence>
          {words.map((word, i) => (
            <motion.div
              key={`${word.text}-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: word.x + dimensions.width / 2, 
                y: word.y + dimensions.height / 2,
                rotate: word.rotate
              }}
              transition={{ 
                delay: i * 0.01,
                type: 'spring',
                stiffness: 80,
                damping: 12
              }}
              className="absolute cursor-default select-none whitespace-nowrap font-bold tracking-tight hover:scale-110 transition-transform duration-300"
              style={{
                fontSize: word.size,
                color: COLORS[i % COLORS.length],
                transform: `translate(-50%, -50%)`,
                textShadow: `0 0 20px ${COLORS[i % COLORS.length]}30`
              }}
            >
              {word.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
