import { Twitter, Linkedin, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const shareUrl = url || window.location.href;
  
  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:text-[#1DA1F2]'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:text-[#0A66C2]'
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Share</span>
      <div className="flex items-center space-x-2">
        {shareLinks.map((link) => (
          <motion.a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-1.5 text-gray-500 ${link.color} transition-colors`}
            title={`Share on ${link.name}`}
          >
            <link.icon className="w-3.5 h-3.5" />
          </motion.a>
        ))}
        {navigator.share && (
          <motion.button
            onClick={handleNativeShare}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 text-gray-500 hover:text-white transition-colors"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
