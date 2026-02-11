import { Link } from 'react-router-dom';
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
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_CONFIG, EXAM_CONFIG, getExamFee, SCHOLARSHIP_CONFIG, REFERRAL_CONFIG } from '@/constants/config';
import { formatCurrency, getOrdinal } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

import heroImg from '@/assets/hero-scholarship.jpg';
import logoImg from '@/assets/gphdm-logo.png';

export function HomePage() {
  const { t, language } = useLanguage();
  
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
      description: `Top ${SCHOLARSHIP_CONFIG.eligibleRanks.length} ranks eligible for scholarships up to ${formatCurrency(SCHOLARSHIP_CONFIG.defaultAmounts[1])}`,
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
    { step: 1, title: 'Register', description: 'Create your account with required details' },
    { step: 2, title: 'Pay Fee', description: 'Complete secure payment via Razorpay' },
    { step: 3, title: 'Take Exam', description: 'Attempt the timed examination' },
    { step: 4, title: 'Get Results', description: 'View rank and receive certificate' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 institutional-gradient" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm mb-6">
                <GraduationCap className="size-4" />
                <span>{t('home.registration.open')} {APP_CONFIG.year}</span>
              </div>
              
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance">
                {t('home.hero.title')}
              </h1>
              
              <p className="text-lg text-white/80 mb-8 max-w-xl text-pretty">
                {t('home.hero.subtitle')}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                    {t('home.hero.registerBtn')}
                    <ArrowRight className="size-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    {t('home.hero.learnMore')}
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">50K+</div>
                      <div className="text-white/70 text-sm">{language === 'hi' ? 'छात्र पंजीकृत' : 'Students Registered'}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">₹25L+</div>
                      <div className="text-white/70 text-sm">{language === 'hi' ? 'छात्रवृत्ति प्रदान' : 'Scholarships Awarded'}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">28</div>
                      <div className="text-white/70 text-sm">{language === 'hi' ? 'राज्य कवर' : 'States Covered'}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">12</div>
                      <div className="text-white/70 text-sm">{language === 'hi' ? 'कक्षा स्तर' : 'Class Levels'}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
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
                    {language === 'hi' ? 'केंद्र बनें' : 'Become a Center'}
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
                  <div className={`inline-flex items-center justify-center size-12 rounded-full mb-3 ${
                    rank === 1 ? 'gold-gradient' :
                    rank === 2 ? 'silver-gradient' :
                    rank === 3 ? 'bronze-gradient' : 'bg-muted'
                  }`}>
                    <Trophy className={`size-6 ${rank <= 3 ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {getOrdinal(rank)} Rank
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(SCHOLARSHIP_CONFIG.defaultAmounts[rank])}
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
