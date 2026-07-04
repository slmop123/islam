import { ArrowLeft, BookOpen, Compass, ExternalLink, Layers, Scale, Sparkles, Rocket } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { Link } from 'react-router-dom';
import { FlyingLetters } from './components/FlyingLetters';

interface GlassCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  isMain?: boolean;
  delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ title, description, href, icon: Icon, isMain = false, delay = 0 }) => {
  const isInternal = href.startsWith('/');
  const InnerLink = isInternal ? Link : 'a';
  const linkProps = isInternal ? { to: href } : { href };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring", bounce: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full h-full min-h-[300px] rounded-3xl border border-white/20
        overflow-hidden group
        shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
        hover:border-white/40 hover:shadow-[0_15px_40px_-10px_rgba(139,92,246,0.3)]
        transition-all duration-500
        ${isMain ? 'md:col-span-2 lg:col-span-2' : ''}
      `}
    >
      <InnerLink {...linkProps} className="block w-full h-full absolute inset-0 text-right">
        
        {/* Background Base with template cuts */}
        <div className="absolute inset-0 p-1 bg-gradient-to-br from-violet-400 to-blue-500">
          <div className="w-full h-full rounded-2xl rounded-tr-[100px] rounded-bl-[40px] bg-[#1a1a2e] transition-all duration-500 group-hover:bg-[#22223b]"></div>
        </div>

        {/* Liquid Glass Orb Effect */}
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-lg rounded-3xl overflow-hidden pointer-events-none z-0">
           <div 
             className={`rounded-full bg-gradient-to-tr from-purple-500 to-orange-300 animate-spin opacity-50 blur-xl transition-all duration-700 group-hover:opacity-80 group-hover:scale-125 ${isMain ? 'w-64 h-64' : 'w-40 h-40'}`}
             style={{ animationDuration: '12s' }}
           ></div>
        </div>

        {/* Content Layout */}
        <div className="absolute inset-0 p-3 sm:p-4 flex justify-between z-10 pointer-events-none">
          {/* Right section: Title & Description */}
          <div className="w-3/4 sm:w-2/3 p-4 flex flex-col rounded-2xl backdrop-blur-xl bg-gray-50/10 border border-white/5 text-gray-200 font-arabic h-full justify-between pointer-events-auto">
             <div>
                <h3 className={`font-bold ${isMain ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} mb-2 text-white drop-shadow-md`}>
                  {title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed drop-shadow-sm font-medium">
                  {description}
                </p>
             </div>
             
             {isMain && (
               <div className="mt-4 px-6 py-3 self-start rounded-full backdrop-blur-xl bg-violet-600/80 border border-violet-400/50 text-white font-arabic font-bold flex items-center gap-2 group-hover:bg-violet-500 transition-colors shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                 الدخول للمحرك 🚀
               </div>
             )}
          </div>
          
          {/* Left section: Icon & Action */}
          <div className="h-full flex flex-col items-center justify-between text-white/60 pointer-events-auto pb-2 pl-2">
             <div className="w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-xl bg-gray-50/20 border border-white/10 text-white shadow-lg group-hover:bg-gray-50/30 transition-colors">
               <Icon size={24} />
             </div>
             
             {!isMain && (
               <div className="w-10 h-10 mt-auto flex items-center justify-center rounded-full backdrop-blur-xl bg-gray-50/20 border border-white/10 cursor-pointer transition-all duration-300 hover:bg-gray-50/30 text-white">
                 <ArrowLeft size={18} />
               </div>
             )}
          </div>
        </div>

      </InnerLink>
    </motion.div>
  );
};

export default function App() {
  return (
    <div className="w-full flex flex-col items-center justify-between p-6 sm:p-12 md:p-20">
      <div className="max-w-6xl w-full mx-auto relative z-10 flex flex-col items-center flex-grow justify-center py-12">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 lg:mb-24 w-full flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 text-blue-200 text-sm font-medium tracking-widest uppercase font-sans shadow-lg"
          >
            <Sparkles size={16} className="text-blue-300" /> Advanced AI Hub
          </motion.div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-2xl mb-6 font-sans select-none" dir="ltr">
            SiteSec Islam
          </h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-arabic font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 drop-shadow-[0_0_20px_rgba(167,139,250,0.6)] mb-8 select-none"
          >
            اعمل لجنتك .... فالنار لا تنتظر
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-lg sm:text-xl lg:text-2xl text-blue-100/80 max-w-3xl mx-auto font-arabic leading-relaxed font-medium"
          >
            المنصة الذكية الأولى من نوعها للباحثين عن اليقين والعمق الشرعي. نجمع بين أصالة الوحي وتقنيات الذكاء الاصطناعي لتقديم أداة استثنائية لطلب العلم.
          </motion.p>
        </motion.div>

        {/* Portals Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
          <GlassCard
            title="محرك القوانين الكونية"
            description="يحول مشاكلك وحلولها الى معادلات بناء على القران والسنة لتطبيقها في حياتك اليومية."
            href="#"
            icon={Compass}
            delay={0.1}
          />
          <GlassCard
            title="رادار الوقت الميت"
            description="حول صفحات الانترنت واوقات الانتظار الى منجم من الحسنات وكنز لا يفنى."
            href="#"
            icon={Layers}
            delay={0.2}
          />
          <GlassCard
            title="محرك هندسة النعيم"
            description="خطط لماذا ستصنع في الجنة، وابنِ قصورك وأنهارَك من الآن."
            href="#"
            icon={BookOpen}
            delay={0.3}
          />
          <GlassCard
            title="SiteSec Multi Poster"
            description="ساهم في نشر الخير واعد نشره من خلال تحميل اي فيديو ديني بضغطة زر."
            href="#"
            icon={ExternalLink}
            delay={0.4}
          />
          <GlassCard
            title="محرك الاستنباط الشرعي العميق"
            description="أنت تكفل به. استخرج الأحكام الشرعية، الفتاوى، والتفسيرات من أمهات الكتب بذكاء اصطناعي دقيق."
            href="/engine.html"
            icon={Scale}
            isMain={true}
            delay={0.5}
          />
        </div>
      </div>
    </div>
  );
}
