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

export function AboutPage() {
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

  const teamMembers = [
    {
      name: 'Dr. Rajendra Prasad',
      role: 'Chairman',
      description: 'Former education minister with 30+ years of experience in educational policy making.',
    },
    {
      name: 'Mrs. Sunita Devi',
      role: 'Director - Operations',
      description: 'Educational administrator specializing in scholarship program management.',
    },
    {
      name: 'Mr. Vikram Singh',
      role: 'Head - Examination',
      description: 'Expert in conducting large-scale examinations with integrity and transparency.',
    },
    {
      name: 'Ms. Priya Sharma',
      role: 'Student Relations',
      description: 'Dedicated to ensuring smooth communication between students and the organization.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-white py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="font-serif text-3xl lg:text-5xl font-bold mb-4">
                हमारे बारे में
              </h1>
              <h2 className="text-xl lg:text-2xl font-semibold mb-4 opacity-90">
                About {APP_CONFIG.organization}
              </h2>
              <p className="text-lg opacity-80 mb-6 max-w-2xl">
                ग्राम पंचायत हेल्प डेस्क मिशन एक गैर-लाभकारी संगठन है जो ग्रामीण और शहरी क्षेत्रों के
                मेधावी छात्रों को छात्रवृत्ति प्रदान करके शिक्षा को बढ़ावा देने के लिए समर्पित है।
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    <GraduationCap className="mr-2 size-5" />
                    Register Now
                  </Button>
                </Link>
                <Link to="/verify">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/30 hover:bg-white/20">
                    Verify Certificate
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="size-40 lg:size-56 bg-white rounded-full p-4 shadow-2xl">
                <img src={gphdmLogo} alt="GPHDM Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="size-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="size-7 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Target className="size-6" />
                  हमारा मिशन (Our Mission)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  भारत के हर कोने से प्रतिभाशाली छात्रों की पहचान करना और उन्हें उचित मान्यता एवं
                  वित्तीय सहायता प्रदान करना। हम मानते हैं कि हर बच्चे में सफल होने की क्षमता है,
                  और हमारा लक्ष्य उन्हें अपनी पूरी क्षमता हासिल करने में मदद करना है।
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To identify talented students from every corner of India and provide them with
                  appropriate recognition and financial assistance. We believe every child has
                  the potential to succeed, and our goal is to help them achieve their full potential.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-accent">
                  <Star className="size-6" />
                  हमारा विज़न (Our Vision)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  एक ऐसा भारत बनाना जहां कोई भी प्रतिभाशाली छात्र आर्थिक बाधाओं के कारण
                  शिक्षा से वंचित न रहे। हम एक समावेशी शिक्षा प्रणाली की कल्पना करते हैं
                  जहां योग्यता ही सफलता का एकमात्र मापदंड हो।
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To create an India where no talented student is deprived of education due to
                  financial barriers. We envision an inclusive education system where merit
                  is the only criterion for success.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">हमारे उद्देश्य (Our Objectives)</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              GPHDM छात्रवृत्ति परीक्षा के माध्यम से शैक्षिक उत्कृष्टता को बढ़ावा देने के लिए प्रतिबद्ध है।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {objectives.map((objective, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <objective.icon className="size-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{objective.title}</h3>
                  <p className="text-sm text-muted-foreground">{objective.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-4">
                परीक्षा की विशेषताएं (Examination Features)
              </h2>
              <p className="text-muted-foreground mb-8">
                GPHDM छात्रवृत्ति परीक्षा एक पारदर्शी और निष्पक्ष मूल्यांकन प्रणाली प्रदान करती है
                जो छात्रों को उनकी योग्यता के आधार पर पुरस्कृत करती है।
              </p>
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="size-5 text-accent flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center bg-primary text-white">
                <BookOpen className="size-10 mx-auto mb-3" />
                <p className="text-3xl font-bold">60</p>
                <p className="text-sm opacity-80">Questions Per Exam</p>
              </Card>
              <Card className="p-6 text-center bg-accent text-white">
                <Award className="size-10 mx-auto mb-3" />
                <p className="text-3xl font-bold">₹10K</p>
                <p className="text-sm opacity-80">Max Scholarship</p>
              </Card>
              <Card className="p-6 text-center bg-orange-500 text-white">
                <Users className="size-10 mx-auto mb-3" />
                <p className="text-3xl font-bold">1-12</p>
                <p className="text-sm opacity-80">All Classes</p>
              </Card>
              <Card className="p-6 text-center bg-purple-600 text-white">
                <Shield className="size-10 mx-auto mb-3" />
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm opacity-80">Secure & Fair</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">हमारी टीम (Our Team)</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              अनुभवी शिक्षाविदों और प्रशासकों की हमारी टीम छात्रों को सर्वोत्तम सेवा प्रदान करने के लिए समर्पित है।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="size-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">संपर्क करें (Contact Us)</h2>
            <p className="text-muted-foreground">
              किसी भी प्रश्न या सहायता के लिए हमसे संपर्क करें।
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="size-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="size-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <a href={`tel:${APP_CONFIG.supportPhone}`} className="text-primary hover:underline">
                  {APP_CONFIG.supportPhone}
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="size-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="size-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Email</h3>
                <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-primary hover:underline text-sm">
                  {APP_CONFIG.supportEmail}
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="size-14 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <MapPin className="size-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Address</h3>
                <p className="text-sm text-muted-foreground">
                  Uttar Pradesh, India
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">
            आज ही रजिस्टर करें! (Register Today!)
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            GPHDM छात्रवृत्ति परीक्षा में भाग लें और अपनी प्रतिभा को पहचान दिलाएं।
            छात्रवृत्ति जीतने का सुनहरा अवसर पाएं!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <GraduationCap className="mr-2 size-5" />
                Register for Exam
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/30 hover:bg-white/20">
                Already Registered? Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
