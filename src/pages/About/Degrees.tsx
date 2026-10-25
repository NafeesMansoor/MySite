import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { EDUCATIONS } from '../../constants';
import { usePageMeta } from '../../seo/usePageMeta';

export default function Degrees() {
  usePageMeta('/about/degrees');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Academic Degrees</h1>
          <p className="text-gray-500 max-w-2xl">A summary of my academic journey and qualifications.</p>
        </div>

        <div className="grid gap-8">
          {EDUCATIONS.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <GraduationCap className="w-8 h-8 text-white/60" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-gray-500">{edu.year}</div>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">{edu.degree}</h2>
                <p className="text-lg text-gray-400">{edu.institution}</p>
                {edu.cgpa && (
                  <p className="text-sm text-gray-500">CGPA: {edu.cgpa}</p>
                )}
                {edu.thesis && (
                  <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/5">
                    <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">Thesis</p>
                    <p className="text-sm text-gray-400 italic leading-relaxed">{edu.thesis}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
