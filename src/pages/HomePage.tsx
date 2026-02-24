import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import {
  GraduationCap,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  BookOpen,
  Trophy,
  BadgeCheck,
  IndianRupee,
  Share2,
  Gift,
  Bell,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG, EXAM_CONFIG, getExamFee, SCHOLARSHIP_CONFIG, REFERRAL_CONFIG } from '@/constants/config';
import { formatCurrency, getOrdinal } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useExamStore } from '@/stores';

import heroImg from '@/assets/hero-scholarship.jpg';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
} as const;

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100 }
  }
} as const;

export function HomePage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { config, loadExamData } = useExamStore();
  const prizes = config.scholarshipPrizes || SCHOLARSHIP_CONFIG.defaultAmounts;

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      console.log('Redirecting to registration with referral code:', refCode);
      navigate(`/register?ref=${refCode}`);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    loadExamData();
  }, [loadExamData]);

  const handleNotify = () => {
    toast({
      title: "Updates Enabled",
      description: "You will be notified about upcoming exams and results.",
    });
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Class 1-12 Coverage',
      description: 'Comprehensive examination for all school levels with age-appropriate questions',
    },
    {
      icon: Clock,
      title: 'Timed Assessment',
      description: `${EXAM_CONFIG.totalQuestions} questions with ${EXAM_CONFIG.defaultTimePerQuestion}s per question, testing quick thinking`,
    },
    {
      icon: Trophy,
      title: 'Merit-Based Rankings',
      description: 'Class-wise rankings based on score, accuracy, and time taken',
    },
    {
      icon: Award,
      title: 'Scholarship Awards',
      description: `Top ${SCHOLARSHIP_CONFIG.eligibleRanks.length} ranks eligible for scholarships up to ${formatCurrency(prizes[1])}`,
    },
    {
      icon: BadgeCheck,
      title: 'Verified Certificates',
      description: 'QR-coded certificates with public verification system',
    },
    {
      icon: Shield,
      title: 'Secure & Fair',
      description: 'One attempt per student with strict fraud prevention measures',
    },
  ];

  const feeStructure = [
    { classes: '1-5', label: 'Primary', fee: getExamFee(1), color: 'from-blue-500/20 to-indigo-500/20' },
    { classes: '6-8', label: 'Middle', fee: getExamFee(6), color: 'from-primary/20 to-accent/20' },
    { classes: '9-12', label: 'Senior', fee: getExamFee(9), color: 'from-purple-500/20 to-pink-500/20' },
  ];

  const steps = [
    { step: 1, title: 'Register', description: 'Create your account using a Center Referral Code' },
    { step: 2, title: 'Pay Fee', description: 'Complete secure payment via Razorpay' },
    { step: 3, title: 'Take Exam', description: 'Attempt the timed examination' },
    { step: 4, title: 'Get Results', description: 'View rank and receive certificate' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20 pb-16 z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex flex-col gap-10 text-center lg:text-left"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center justify-center lg:justify-start gap-3 self-center lg:self-start rounded-full bg-primary/10 border border-primary/20 px-6 py-3 backdrop-blur-xl shadow-[0_0_20px_rgba(255,165,0,0.2)]">
                <Sparkles className="size-5 text-primary animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  {t('home.registration.open')} {APP_CONFIG.year}
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tighter text-white overflow-visible">
                {t('home.hero.title')}
              </motion.h1>

              <motion.div variants={itemVariants} className="space-y-6">
                <p className="text-2xl sm:text-3xl font-black premium-text-gradient tracking-wide">
                  {t('home.hero.missionLine')}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white/40 uppercase tracking-[0.4em]">
                  {t('home.hero.production')}
                </p>
                <p className="text-xl text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium italic">
                  {t('home.hero.subtitle')}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 mt-6 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" className="h-18 px-12 institutional-gradient text-white text-xl font-black group shadow-[0_0_40px_rgba(255,165,0,0.4)] hover:scale-105 transition-all rounded-full border-0">
                    {t('home.hero.registerBtn')}
                    <ArrowRight className="ml-4 size-6 group-hover:translate-x-3 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-18 px-10 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xl font-black backdrop-blur-xl rounded-full gap-4 transition-all"
                  onClick={() => window.open(APP_CONFIG.notificationGroupUrl, '_blank')}
                >
                  <Bell className="size-6 text-primary" />
                  {language === 'hi' ? 'अपडेट' : 'Updates'}
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block relative"
            >
              <div className="relative z-10 aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 group">
                <img
                  src={heroImg}
                  alt="National Scholarship Excellence"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2000ms] grayscale-[0.2] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60" />
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-20 top-1/4 glass-card-heavy rounded-3xl p-8 border border-white/20 shadow-2xl z-20"
              >
                <div className="flex items-center gap-6">
                  <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,165,0,0.3)]">
                    <Users className="size-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">50K+</div>
                    <div className="text-xs text-white/40 uppercase tracking-[0.2em] font-black">Students</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-16 bottom-1/4 glass-card-heavy rounded-3xl p-8 border border-emerald-500/20 shadow-2xl z-20"
              >
                <div className="flex items-center gap-6">
                  <div className="size-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <Trophy className="size-8 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">₹25L+</div>
                    <div className="text-xs text-white/40 uppercase tracking-[0.2em] font-black">Rewards</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter">
              {t('home.features.title')}
            </h2>
            <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium italic">
              {t('home.features.subtitle')} Experience a next-generation platform designed for excellence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative"
              >
                <div className="glass-card-heavy p-10 rounded-[3rem] border border-white/5 hover:border-primary/30 transition-all duration-700 h-full flex flex-col group-hover:-translate-y-4">
                  <div className="size-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500 shadow-xl">
                    <feature.icon className="size-10 text-primary" />
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-white/40 leading-relaxed text-lg">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl lg:text-7xl font-black mb-8 premium-text-gradient tracking-tighter">
              {t('home.fees.title')}
            </h2>
            <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium">
              {t('home.fees.subtitle')} Accessible intelligence assessment for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {feeStructure.map((item, i) => (
              <motion.div
                key={item.classes}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-card rounded-[3.5rem] p-12 text-center border-white/5 relative group hover:scale-105 transition-all duration-500"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-[3.5rem]`} />
                <div className="relative z-10">
                  <div className="inline-flex size-24 rounded-3xl bg-white/5 border border-white/10 mb-10 items-center justify-center group-hover:scale-110 transition-transform">
                    <IndianRupee className="size-12 text-primary" />
                  </div>
                  <div className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">
                    {item.label}
                  </div>
                  <div className="text-3xl font-black text-white mb-8">
                    Class {item.classes}
                  </div>
                  <div className="text-6xl font-black text-white premium-text-glow">
                    {formatCurrency(item.fee)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-32 relative overflow-hidden bg-white/5 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium italic">
              {t('home.howItWorks.subtitle')} Start your journey to excellence in 4 simple steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="glass-card-heavy rounded-[3rem] p-10 text-center h-full border-white/5 group hover:border-primary/40 transition-all">
                  <div className="size-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-black mb-10 mx-auto shadow-2xl shadow-primary/40 group-hover:rotate-6 transition-transform">
                    {item.step}
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-white">{item.title}</h3>
                  <p className="text-white/40 text-lg leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 rounded-full px-8 py-4 text-primary font-black tracking-widest text-xs mb-10 border border-primary/20">
                <Share2 className="size-5" />
                <span>PARTNERSHIP PROGRAM</span>
              </div>

              <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-none tracking-tighter">
                {t('home.centerCode.title')}
              </h2>

              <p className="text-xl text-white/50 mb-12 leading-relaxed font-bold italic">
                {t('home.centerCode.subtitle')} Transform your institute into an excellence hub.
              </p>

              <div className="space-y-8 mb-16">
                {[
                  { icon: IndianRupee, title: 'Center Rewards', val: REFERRAL_CONFIG.centerCodeReward, text: 'text-primary', bg: 'bg-primary/10' },
                  { icon: Shield, title: 'Admin Rewards', val: REFERRAL_CONFIG.adminCenterReward, text: 'text-accent', bg: 'bg-accent/10' }
                ].map((reward, i) => (
                  <div key={i} className="flex items-center gap-8 glass-card rounded-[2.5rem] p-8 border-white/5 hover:border-white/10 transition-all">
                    <div className={`size-20 ${reward.bg} rounded-3xl flex items-center justify-center flex-shrink-0 shadow-2xl`}>
                      <reward.icon className={`size-10 ${reward.text}`} />
                    </div>
                    <div>
                      <h4 className="font-black text-2xl text-white mb-2">{reward.title}</h4>
                      <p className="text-white/40 text-lg">
                        Earn <strong className={`${reward.text} text-3xl font-black px-2`}>{formatCurrency(reward.val)}</strong> per referral
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-6">
                <Link to="/center-registration">
                  <Button size="lg" className="h-18 px-10 institutional-gradient text-white rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-transform">
                    <Gift className="size-7 mr-3" />
                    {language === 'hi' ? 'रजिस्टर करें' : 'Register Center'}
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="h-18 px-10 rounded-full font-black text-xl border-white/10 text-white hover:bg-white/5">
                    Details
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card-heavy rounded-[4rem] p-12 lg:p-16 text-white border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
              <h3 className="text-3xl font-black mb-12 text-center premium-text-glow uppercase tracking-tighter">How it works</h3>
              <div className="space-y-12">
                {[
                  { step: 1, title: 'Apply Now', desc: 'Become an approved partner' },
                  { step: 2, title: 'Access Code', desc: 'Get your unique CC ID' },
                  { step: 3, title: 'Share & Grow', desc: 'Refer students securely' },
                  { step: 4, title: 'Earn Legacy', desc: 'Instant payouts per student' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-8 group">
                    <div className="size-18 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black text-2xl group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-black text-2xl mb-1 text-white">{item.title}</h4>
                      <p className="text-white/40 text-lg font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl lg:text-7xl font-black mb-8 text-white tracking-tighter">
              {t('home.scholarship.title')}
            </h2>
            <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium italic">
              {t('home.scholarship.subtitle')} Our elite scholars are deeply rewarded.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {SCHOLARSHIP_CONFIG.eligibleRanks.slice(0, 5).map((rank) => {
              const gradients = {
                1: 'from-yellow-400 to-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.3)]',
                2: 'from-gray-300 to-gray-500 shadow-[0_0_30px_rgba(209,213,219,0.3)]',
                3: 'from-orange-400 to-orange-600 shadow-[0_0_30px_rgba(249,115,22,0.3)]',
                others: 'from-white/10 to-white/5'
              };
              const grad = rank === 1 ? gradients[1] : rank === 2 ? gradients[2] : rank === 3 ? gradients[3] : gradients.others;

              return (
                <motion.div
                  key={rank}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: rank * 0.1 }}
                  className="glass-card-heavy rounded-[3rem] p-10 text-center border-white/5 hover:-translate-y-4 transition-all duration-500"
                >
                  <div className={`inline-flex size-24 rounded-3xl bg-gradient-to-br ${grad} items-center justify-center mb-8 shadow-2xl`}>
                    <Trophy className="size-12 text-white" />
                  </div>
                  <div className="text-sm font-black text-white/30 uppercase tracking-[0.3em] mb-4">
                    {getOrdinal(rank)} Rank
                  </div>
                  <div className="text-4xl font-black text-white premium-text-glow">
                    {formatCurrency(prizes[rank] || 0)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-[4rem] p-20 lg:p-32 border-white/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -z-10 group-hover:bg-primary/30 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px] -z-10 group-hover:bg-accent/30 transition-all duration-1000" />

            <h2 className="text-6xl lg:text-8xl font-black text-white mb-10 leading-none tracking-tighter">
              {t('home.cta.title')}
            </h2>
            <p className="text-2xl text-white/50 mb-16 max-w-3xl mx-auto font-bold italic leading-relaxed">
              {t('home.cta.subtitle')} Join millions of students participating nationwide.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="/register">
                <Button size="lg" className="h-20 px-16 bg-white text-black hover:bg-white/90 rounded-full text-2xl font-black shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-110 transition-all">
                  {t('home.hero.registerBtn')}
                  <ArrowRight className="size-10 ml-4" />
                </Button>
              </Link>
              <Link to="/verify">
                <Button size="lg" variant="outline" className="h-20 px-16 border-white/20 text-white hover:bg-white/5 backdrop-blur-xl rounded-full text-2xl font-black">
                  <CheckCircle className="size-10 mr-4" />
                  {t('nav.verify')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
