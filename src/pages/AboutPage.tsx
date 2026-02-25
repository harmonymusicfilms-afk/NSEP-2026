import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Users,
  Target,
  BookOpen,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Building,
  Heart,
  Shield,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/constants/config';
import gphdmLogo from '@/assets/gphdm-logo.png';
import { useTeamStore } from '@/stores/teamStore';
import { motion } from 'framer-motion';

export function AboutPage() {
  const { members, loadMembers } = useTeamStore();

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const stats = [
    { icon: Users, value: '50,000+', label: 'Students Registered' },
    { icon: Award, value: '10,000+', label: 'Scholarships Awarded' },
    { icon: MapPin, value: '28+', label: 'States Covered' },
    { icon: Building, value: '5,000+', label: 'Schools Partnered' },
  ];

  const objectives = [
    {
      icon: Target,
      title: 'Identify Talent',
      description: 'Discover and recognize academically talented students from rural and urban areas across India.',
    },
    {
      icon: Heart,
      title: 'Support Education',
      description: 'Provide financial assistance through scholarships to deserving students for their continued education.',
    },
    {
      icon: TrendingUp,
      title: 'Encourage Excellence',
      description: 'Motivate students to strive for academic excellence through competitive examinations.',
    },
    {
      icon: Shield,
      title: 'Equal Opportunity',
      description: 'Ensure equal access to educational opportunities regardless of economic background.',
    },
  ];

  const features = [
    'Class-wise competitive examinations (Class 1 to 12)',
    'Transparent and fair evaluation system',
    'Cash scholarships for top performers',
    'Merit certificates with QR verification',
    'Online registration and examination',
    'Real-time result publication',
    'Class-wise ranking system',
    'Secure payment gateway integration',
    'Student dashboard for tracking progress',
    'Email notifications and updates',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl lg:text-7xl font-bold mb-6 text-primary">
                  हमारे बारे में
                </h1>
                <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-foreground opacity-90">
                  About {APP_CONFIG.organization}
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                  ग्राम पंचायत हेल्प डेस्क मिशन एक गैर-लाभकारी संगठन है जो ग्रामीण और शहरी क्षेत्रों के
                  मेधावी छात्रों को छात्रवृत्ति प्रदान करके शिक्षा को बढ़ावा देने के लिए समर्पित है।
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/register">
                    <Button size="lg" className="h-14 px-8 institutional-gradient text-white rounded-full font-bold shadow-[0_0_20px_rgba(255,165,0,0.4)] hover:scale-105 transition-transform">
                      <GraduationCap className="mr-2 size-6" />
                      Register Now
                    </Button>
                  </Link>
                  <Link to="/verify">
                    <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-border text-foreground hover:bg-secondary/20 transition-all font-bold">
                      Verify Certificate
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-shrink-0"
            >
              <div className="size-48 lg:size-72 p-1 rounded-full bg-gradient-to-br from-primary via-accent to-primary shadow-[0_0_50px_rgba(33,150,243,0.3)]">
                <div className="w-full h-full bg-background rounded-full p-8 flex items-center justify-center overflow-hidden">
                  <img src={gphdmLogo} alt="GPHDM Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(33,150,243,0.5)]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background rounded-3xl p-8 text-center border border-border hover:border-primary/30 transition-all group shadow-sm"
              >
                <div className="size-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(33,150,243,0.2)]">
                  <stat.icon className="size-8 text-primary" />
                </div>
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-background rounded-[2rem] p-10 border-l-8 border-l-primary border border-border shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Target className="size-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">हमारा मिशन</h2>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed font-hindi">
                  भारत के हर कोने से प्रतिभाशाली छात्रों की पहचान करना और उन्हें उचित मान्यता एवं
                  वित्तीय सहायता प्रदान करना। हम मानते हैं कि हर बच्चे में सफल होने की क्षमता है।
                </p>
                <p className="text-lg text-muted-foreground/70 leading-relaxed italic border-l-2 border-primary/30 pl-6">
                  To identify talented students from every corner of India and provide them with
                  appropriate recognition and financial assistance.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-background rounded-[2rem] p-10 border-l-8 border-l-accent border border-border shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-accent/10 rounded-2xl">
                  <Star className="size-10 text-accent" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">हमारा विज़न</h2>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed font-hindi">
                  एक ऐसा भारत बनाना जहां कोई भी प्रतिभाशाली छात्र आर्थिक बाधाओं के कारण
                  शिक्षा से वंचित न रहे। हम एक समावेशी शिक्षा प्रणाली की कल्पना करते हैं।
                </p>
                <p className="text-lg text-muted-foreground/70 leading-relaxed italic border-l-2 border-accent/30 pl-6">
                  To create an India where no talented student is deprived of education due to
                  financial barriers.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-24 relative bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-primary">हमारे उद्देश्य</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GPHDM छात्रवृत्ति परीक्षा के माध्यम से शैक्षिक उत्कृष्टता को बढ़ावा देने के लिए प्रतिबद्ध है।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {objectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background rounded-3xl p-8 text-center border border-border hover:border-primary/30 transition-all group shadow-sm"
              >
                <div className="size-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <objective.icon className="size-10 text-primary" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-4">{objective.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{objective.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-8 text-foreground">
                परीक्षा की विशेषताएं
              </h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 bg-secondary/20 p-4 rounded-2xl border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="size-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="size-5 text-accent" />
                    </div>
                    <span className="text-muted-foreground font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: BookOpen, value: '60', label: 'Questions', color: 'from-primary/10 to-primary/20', text: 'text-primary' },
                { icon: Award, value: '₹10K', label: 'Max Reward', color: 'from-accent/10 to-accent/20', text: 'text-accent' },
                { icon: Users, value: '1-12', label: 'All Classes', color: 'from-primary/10 to-primary/15', text: 'text-primary' },
                { icon: Shield, value: '100%', label: 'Secure', color: 'from-accent/10 to-accent/15', text: 'text-accent' }
              ].map((item, idx) => (
                <div key={idx} className={`bg-background p-10 text-center rounded-[2.5rem] bg-gradient-to-br ${item.color} border border-border shadow-sm hover:shadow-md transition-shadow`}>
                  <item.icon className={`size-12 mx-auto mb-4 ${item.text}`} />
                  <p className="text-4xl font-bold text-foreground mb-2">{item.value}</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 relative bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">हमारी टीम (Our Team)</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              अनुभवी शिक्षाविदों और प्रशासकों की हमारी टीम छात्रों को सर्वोत्तम सेवा प्रदान करने के लिए समर्पित है।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background rounded-[2.5rem] p-8 text-center border border-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="relative group mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="size-24 mx-auto rounded-full object-cover border-4 border-border relative z-10"
                    />
                  ) : (
                    <div className="size-24 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold border-4 border-border relative z-10">
                      {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-xl text-foreground mb-1">{member.name}</h3>
                <p className="text-sm text-primary font-bold uppercase tracking-widest mb-4">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Grid Section */}
      <section className="py-24 relative bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Phone, title: 'Phone', value: APP_CONFIG.supportPhone, href: `tel:${APP_CONFIG.supportPhone}`, color: 'text-primary' },
              { icon: Mail, title: 'Email', value: APP_CONFIG.supportEmail, href: `mailto:${APP_CONFIG.supportEmail}`, color: 'text-accent' },
              { icon: MapPin, title: 'Address', value: 'Uttar Pradesh, India', href: '#', color: 'text-primary' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-background rounded-3xl p-10 text-center border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="size-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <item.icon className={`size-8 ${item.color}`} />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">{item.title}</h3>
                <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors block text-lg font-medium break-all">
                  {item.value}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="bg-white rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 group-hover:bg-primary/20 transition-all" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -z-10 group-hover:bg-accent/20 transition-all" />

            <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-primary">
              आज ही रजिस्टर करें!
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-bold">
              GPHDM छात्रवृत्ति परीक्षा में भाग लें और अपनी प्रतिभा को पहचान दिलाएं।
              छात्रवृत्ति जीतने का सुनहरा अवसर पाएं!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button size="lg" className="h-16 px-10 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-primary/90 transition-all text-lg">
                  <GraduationCap className="mr-3 size-6" />
                  Register for Exam
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full border-primary text-primary hover:bg-primary/10 transition-all font-bold text-lg">
                  Already Registered? Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
