import { motion } from 'motion/react';
import { Users, Globe, Award, Briefcase } from 'lucide-react';
import { COMMUNITY_SERVICES } from '../../constants';
import { usePageMeta } from '../../seo/usePageMeta';

export default function Community() {
  usePageMeta('/services/community');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Service to the Community</h1>
          <p className="text-gray-500 max-w-2xl">Professional leadership, editorial contributions, and community engagement efforts in the global academic and technical landscape.</p>
        </div>

        <div className="space-y-16">
          {/* Editorial Roles */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-400 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              Editorial Contributions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {COMMUNITY_SERVICES.filter(s => s.role.includes('Editor')).map((service, idx) => (
                <ServiceCard key={idx} service={service} color="indigo" />
              ))}
            </div>
          </section>

          {/* Professional Leadership */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-violet-400 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              Professional Leadership
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {COMMUNITY_SERVICES.filter(s => s.role.includes('Coordinator') || s.role.includes('Treasurer')).map((service, idx) => (
                <ServiceCard key={idx} service={service} color="violet" />
              ))}
            </div>
          </section>

          {/* Conference Leadership */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              Conference Leadership
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {COMMUNITY_SERVICES.filter(s => s.role.includes('Chair') || s.role.includes('Publication')).map((service, idx) => (
                <ServiceCard key={idx} service={service} color="purple" />
              ))}
            </div>
          </section>

          {/* Judging & Mentorship */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-sky-400 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              Judging & Mentorship
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {COMMUNITY_SERVICES.filter(s => s.role.includes('Judge')).map((service, idx) => (
                <ServiceCard key={idx} service={service} color="sky" />
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

const ServiceCard = ({ service, color }: { service: any, color: string, key?: any }) => {
  const colorMap: Record<string, string> = {
    indigo: 'border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 text-indigo-400',
    violet: 'border-violet-500/20 hover:border-violet-500/40 bg-violet-500/5 text-violet-400',
    purple: 'border-purple-500/20 hover:border-purple-500/40 bg-purple-500/5 text-purple-400',
    sky: 'border-sky-500/20 hover:border-sky-500/40 bg-sky-500/5 text-sky-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`p-6 rounded-2xl border transition-all duration-300 ${colorMap[color].split(' ').slice(0, 2).join(' ')} bg-zinc-900/50 hover:bg-zinc-900`}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-4">
          <h3 className={`font-bold text-lg leading-tight ${colorMap[color].split(' ').pop()}`}>
            {service.role}
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-0.5 rounded shrink-0">
            {service.period}
          </span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          {service.organization}
        </p>
      </div>
    </motion.div>
  );
}
