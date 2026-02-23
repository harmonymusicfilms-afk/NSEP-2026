import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_CONFIG, EXAM_CONFIG, getExamFee, SCHOLARSHIP_CONFIG, REFERRAL_CONFIG } from '@/constants/config';
import { formatCurrency, getOrdinal } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useExamStore } from '@/stores';

import heroImg from '@/assets/hero-scholarship.jpg';
import logoImg from '@/assets/gphdm-logo.png';

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0a192f] text-white academic-pattern">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute left-0 top-1/4 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-blue-900/40 blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 text-center lg:text-left animate-in fade-in slide-in-from-left duration-1000">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 self-center lg:self-start rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20 backdrop-blur-sm">
                <BadgeCheck className="size-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {t('home.registration.open')} {APP_CONFIG.year}
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-white mb-4">
                {t('home.hero.title')}
              </h1>

              <p className="text-xl sm:text-2xl font-bold text-primary mb-2 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200 bg-primary/10 inline-block px-4 py-1 rounded-lg border border-primary/20">
                {t('home.hero.missionLine')}
              </p>

              <p className="text-lg sm:text-xl font-medium text-white/90 mb-6 uppercase tracking-wider">
                {t('home.hero.production')}
              </p>

              <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-4">
                {t('home.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" className="h-14 px-8 bg-primary text-[#0a192f] hover:bg-primary/90 text-lg font-bold group shadow-lg shadow-primary/20">
                    {t('home.hero.registerBtn')}
                    <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-6 border-white/20 text-white hover:bg-white/10 text-lg font-bold backdrop-blur-sm gap-2"
                  onClick={() => window.open(APP_CONFIG.notificationGroupUrl, '_blank')}
                >
                  <Bell className="size-5" />
                  {language === 'hi' ? 'अपडेट प्राप्त करें' : 'Get Updates'}
                </Button>
                <Link to="/about">
                  <Button size="lg" variant="ghost" className="h-14 px-6 text-white/70 hover:text-white hover:bg-white/5 text-lg font-medium">
                    {t('home.hero.learnMore')}
                  </Button>
                </Link>
              </div>

              {/* Mobile Stats (Only visible on small screens below lg) */}
              <div className="grid grid-cols-2 gap-4 mt-12 lg:hidden">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-primary">50K+</div>
                  <div className="text-[10px] font-medium text-white/50 uppercase tracking-widest">Students</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-primary">₹25L+</div>
                  <div className="text-[10px] font-medium text-white/50 uppercase tracking-widest">Scholarships</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative animate-in fade-in slide-in-from-right duration-1000 delay-200">
              <div className="relative">
                {/* Image Container with decorative frame */}
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/20 to-transparent blur-2xl" />
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src={heroImg}
                    alt="National Scholarship Excellence"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/80 via-transparent to-transparent" />
                </div>

                {/* Floating Stats Cards */}
                <div className="absolute -left-12 bottom-12 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl max-w-[200px] animate-bounce-subtle">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">50K+</div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest">Students</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 top-12 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl max-w-[200px] animate-bounce-subtle-delayed">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Trophy className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">₹25L+</div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest">Awarded</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Signals Row (Desktop) */}
          <div className="hidden lg:grid grid-cols-3 gap-8 mt-24">
            {[
              { icon: Users, label: 'Students Registered', value: '50,000+' },
              { icon: GraduationCap, label: 'States Covered', value: '28' },
              { icon: Shield, label: 'Center Partners', value: '500+' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <stat.icon className="size-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs font-medium text-white/50 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              {t('home.fees.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.fees.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {feeStructure.map((item) => (
              <Card key={item.classes} className="text-center hover:shadow-elevated transition-shadow">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
                    <IndianRupee className="size-8 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    {item.label}
                  </div>
                  <div className="text-lg font-medium text-foreground mb-2">
                    Class {item.classes}
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(item.fee)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="size-16 rounded-full institutional-gradient flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CenterCode Referral Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-2 text-orange-700 text-sm mb-6">
                <Share2 className="size-4" />
                <span>CC Rewards Program</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
                {t('home.centerCode.title')}
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                {t('home.centerCode.subtitle')}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-sm">
                  <div className="size-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="size-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Center Code Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn <strong className="text-orange-600">{formatCurrency(REFERRAL_CONFIG.centerCodeReward)}</strong> for every student you refer
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-sm">
                  <div className="size-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Admin Center Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Admin codes earn <strong className="text-blue-600">{formatCurrency(REFERRAL_CONFIG.adminCenterReward)}</strong> per referral
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/center-registration">
                  <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
                    <Gift className="size-4" />
                    {language === 'hi' ? 'पार्टनर बनें' : 'Become a Partner'}
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="font-semibold text-xl mb-6 text-center">How CenterCode Works</h3>
              <div className="space-y-6">
                {[
                  { step: 1, title: 'Register as Center', desc: 'Apply to become an approved center' },
                  { step: 2, title: 'Get Your Code', desc: 'Receive unique CC referral code' },
                  { step: 3, title: 'Share & Refer', desc: 'Share code with students' },
                  { step: 4, title: 'Earn Rewards', desc: 'Get paid for each registration' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="size-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scholarship Prizes */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              {t('home.scholarship.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.scholarship.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {SCHOLARSHIP_CONFIG.eligibleRanks.slice(0, 5).map((rank) => (
              <Card
                key={rank}
                className={`text-center ${rank <= 3 ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center size-12 rounded-full mb-3 ${rank === 1 ? 'gold-gradient' :
                    rank === 2 ? 'silver-gradient' :
                      rank === 3 ? 'bronze-gradient' : 'bg-muted'
                    }`}>
                    <Trophy className={`size-6 ${rank <= 3 ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {getOrdinal(rank)} Rank
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(prizes[rank] || 0)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            * Ranks 6-10 also receive scholarships and merit certificates
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 institutional-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                {t('home.hero.registerBtn')}
                <ArrowRight className="size-5" />
              </Button>
            </Link>
            <Link to="/verify">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                <CheckCircle className="size-5" />
                {t('nav.verify')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
