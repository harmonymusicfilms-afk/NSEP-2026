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
    { classes: '1-5', label: 'Primary', fee: getExamFee(1) },
    { classes: '6-8', label: 'Middle', fee: getExamFee(6) },
    { classes: '9-12', label: 'Senior', fee: getExamFee(9) },
  ];

  const steps = [
    { step: 1, title: 'Register', description: 'Create your account using a Center Referral Code' },
    { step: 2, title: 'Pay Fee', description: 'Complete secure payment via Razorpay' },
    { step: 3, title: 'Take Exam', description: 'Attempt the timed examination' },
    { step: 4, title: 'Get Results', description: 'View rank and receive certificate' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#030712]">
        {/* Modern animated background elements - ensure they stay behind content but on top of base bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] via-[#111928] to-[#0A0B10] z-0" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-glow-pulse z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px] mix-blend-screen animate-glow-pulse z-0" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20 pb-16 z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex flex-col gap-8 text-center lg:text-left"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center justify-center lg:justify-start gap-2 self-center lg:self-start rounded-full bg-white/5 border border-white/10 px-5 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <Sparkles className="size-4 text-accent animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-accent">
                  {t('home.registration.open')} {APP_CONFIG.year}
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="font-serif text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-2xl">
                {t('home.hero.title')}
              </motion.h1>

              <motion.div variants={itemVariants}>
                <p className="inline-block text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 tracking-wide">
                  {t('home.hero.missionLine')}
                </p>
                <p className="text-lg sm:text-xl font-medium text-white/50 uppercase tracking-[0.3em] mb-4">
                  {t('home.hero.production')}
                </p>
                <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                  {t('home.hero.subtitle')}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 mt-6 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" className="h-16 px-10 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-white text-lg font-bold group shadow-[0_0_30px_rgba(80,80,255,0.3)] hover:shadow-[0_0_40px_rgba(80,80,255,0.5)] transition-all rounded-full border-0">
                    {t('home.hero.registerBtn')}
                    <ArrowRight className="ml-3 size-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white text-lg font-bold backdrop-blur-md rounded-full gap-3 transition-all"
                  onClick={() => window.open(APP_CONFIG.notificationGroupUrl, '_blank')}
                >
                  <Bell className="size-5 text-accent" />
                  {language === 'hi' ? 'अपडेट प्राप्त करें' : 'Get Updates'}
                </Button>
              </motion.div>

              {/* Mobile Stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mt-8 lg:hidden">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-1">50K+</div>
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-widest">Students</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-emerald-400 mb-1">₹25L+</div>
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-widest">Scholarships</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, type: "spring" }}
              className="hidden lg:block relative"
            >
              <div className="relative z-10 aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
                <img
                  src={heroImg}
                  alt="National Scholarship Excellence"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-16 top-1/4 bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl z-20"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="size-6 text-primary-light" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">50K+</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Students Joined</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-12 bottom-1/4 bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20 shadow-2xl z-20"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Trophy className="size-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">₹25L+</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Rewards Distributed</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Desktop Stats Strip */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="hidden lg:grid grid-cols-3 gap-8 mt-28 max-w-5xl mx-auto"
          >
            {[
              { icon: Users, label: 'Students Registered', value: '50,000+', color: 'text-primary-light' },
              { icon: GraduationCap, label: 'States Covered', value: '28', color: 'text-accent' },
              { icon: Shield, label: 'Center Partners', value: '500+', color: 'text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-5 bg-white/[0.03] hover:bg-white/[0.08] transition-colors backdrop-blur-lg rounded-3xl p-6 border border-white/5 cursor-default relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`size-14 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} shadow-inner`}>
                  <stat.icon className="size-7" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                  <div className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#0B0F19] mb-6">
              {t('home.features.title')}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
              {t('home.features.subtitle')} Experience a next-generation platform designed for massive scale and perfect accuracy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 rounded-[2rem] border border-gray-100 bg-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 z-10 h-full flex flex-col">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="size-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px]">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Futuristic Fee Structure */}
      <section className="py-28 relative bg-[#020817] text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              {t('home.fees.title')}
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {t('home.fees.subtitle')} Accessible intelligence assessment for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {feeStructure.map((item, i) => (
              <motion.div
                key={item.classes}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 text-center relative group hover:border-primary/50 transition-colors duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-white/5 border border-white/10 mb-8 group-hover:rotate-12 transition-transform duration-500">
                    <IndianRupee className="size-10 text-primary-light" />
                  </div>
                  <div className="text-sm font-bold text-accent uppercase tracking-[0.2em] mb-3">
                    {item.label}
                  </div>
                  <div className="text-xl font-medium text-white/80 mb-6">
                    Class {item.classes}
                  </div>
                  <div className="flex justify-center items-baseline gap-1">
                    <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">{formatCurrency(item.fee)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Glass Steps */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#0B0F19] mb-6">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {t('home.howItWorks.subtitle')} Start your journey to excellence in 4 simple steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-1/2 w-full h-[2px] bg-gradient-to-r from-primary/50 to-transparent border-dashed z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="size-20 rounded-[2rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-black mb-8 shadow-xl shadow-primary/30 ring-8 ring-white transform rotate-3 hover:rotate-6 transition-transform">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-2xl mb-3 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-[15px] leading-relaxed px-4">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards - Neon Blocks */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[150px] -z-10 transform -translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/10 rounded-full px-5 py-2 text-orange-600 font-bold tracking-wide text-sm mb-8 border border-orange-500/20">
                <Share2 className="size-4" />
                <span>PARTNERSHIP PROGRAM</span>
              </div>

              <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {t('home.centerCode.title')}
              </h2>

              <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
                {t('home.centerCode.subtitle')} Transform your institute into an excellence hub.
              </p>

              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-6 bg-white border border-gray-100 rounded-3xl p-6 shadow-xl hover:border-orange-500/30 transition-colors">
                  <div className="size-16 bg-orange-500/10 rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="size-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1 text-gray-900">Center Code Rewards</h3>
                    <p className="text-gray-500 font-medium">
                      Earn <strong className="text-orange-600 text-lg px-1">{formatCurrency(REFERRAL_CONFIG.centerCodeReward)}</strong> for every student you refer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-white border border-gray-100 rounded-3xl p-6 shadow-xl hover:border-blue-500/30 transition-colors">
                  <div className="size-16 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
                    <Shield className="size-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1 text-gray-900">Admin Center Rewards</h3>
                    <p className="text-gray-500 font-medium">
                      Admin codes earn <strong className="text-blue-600 text-lg px-1">{formatCurrency(REFERRAL_CONFIG.adminCenterReward)}</strong> per referral
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-5">
                <Link to="/center-registration">
                  <Button size="lg" className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold gap-2 shadow-[0_0_20px_rgba(2ea3f2,0.3)] border-0">
                    <Gift className="size-5" />
                    {language === 'hi' ? 'अपना केंद्र पंजीकृत करें' : 'Register Your Center'}
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-full font-bold border-2 text-gray-900">
                    Learn More
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[3rem] shadow-2xl p-10 lg:p-12 text-white border border-white/10"
            >
              <h3 className="font-serif font-bold text-3xl mb-10 text-center">How CenterCode Works</h3>
              <div className="space-y-8">
                {[
                  { step: 1, title: 'Register as Center', desc: 'Apply to become an approved center partner' },
                  { step: 2, title: 'Get Your Code', desc: 'Receive unique CC referral identification' },
                  { step: 3, title: 'Share & Refer', desc: 'Share code securely with students' },
                  { step: 4, title: 'Earn Rewards', desc: 'Get paid instantly for each registration' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-6">
                    <div className="size-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1">{item.title}</h4>
                      <p className="text-white/60 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scholarship Prizes Highlights (Animated Cards) */}
      <section className="py-28 bg-[#0B0F19] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold mb-6">
              {t('home.scholarship.title')}
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {t('home.scholarship.subtitle')} Our elite scholars are deeply rewarded.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {SCHOLARSHIP_CONFIG.eligibleRanks.slice(0, 5).map((rank) => (
              <motion.div
                key={rank}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className={`bg-white/5 backdrop-blur-md rounded-[2rem] p-6 text-center border transition-all ${rank <= 3 ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-white/10'}`}
              >
                <div className={`inline-flex items-center justify-center size-16 rounded-2xl mb-4 ${rank === 1 ? 'gold-gradient shadow-lg shadow-yellow-500/50' :
                  rank === 2 ? 'silver-gradient shadow-lg shadow-gray-400/50' :
                    rank === 3 ? 'bronze-gradient shadow-lg shadow-orange-700/50' : 'bg-white/10'
                  }`}>
                  <Trophy className={`size-8 ${rank <= 3 ? 'text-white' : 'text-white/60'}`} />
                </div>
                <div className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">
                  {getOrdinal(rank)} Rank
                </div>
                <div className="text-2xl font-black text-white">
                  {formatCurrency(prizes[rank] || 0)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Epic Gradient */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-emerald-400" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl sm:text-6xl font-black text-white mb-8 leading-tight drop-shadow-xl"
          >
            {t('home.cta.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium"
          >
            {t('home.cta.subtitle')} Join millions of students participating nationwide.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Link to="/register">
              <Button size="lg" className="h-16 px-10 bg-white text-primary hover:bg-white/90 gap-3 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
                {t('home.hero.registerBtn')}
                <ArrowRight className="size-6" />
              </Button>
            </Link>
            <Link to="/verify">
              <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white/40 text-white hover:bg-white/20 gap-3 rounded-full text-lg font-bold backdrop-blur-md transition-all">
                <CheckCircle className="size-6" />
                {t('nav.verify')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
