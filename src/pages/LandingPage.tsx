import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, BadgeCheck, Star, Car, Store, Contact, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import { API_URL } from '../config';

export default function LandingPage() {
  const [headerAnimation, setHeaderAnimation] = useState('fade');

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
      .then(res => {
        if (res.data && res.data.headerAnimation) {
          setHeaderAnimation(res.data.headerAnimation);
        }
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-secondary-container selection:text-on-secondary-container">
      <Header animationType={headerAnimation} />
      <main>
        <Hero />
        <Services />
        <Portfolio />
      </main>
      <Footer />
    </div>
  );
}

function Header({ animationType }: { animationType: string }) {
  let initial = { opacity: 0, y: -20 };
  let animate = { opacity: 1, y: 0 };
  let transition: any = { duration: 0.5 };

  if (animationType === 'slide') {
    initial = { opacity: 0, x: -50, y: 0 } as any;
    animate = { opacity: 1, x: 0, y: 0 } as any;
  } else if (animationType === 'bounce') {
    initial = { opacity: 0, y: -50 } as any;
    animate = { opacity: 1, y: 0 } as any;
    transition = { type: 'spring', stiffness: 300, damping: 10 };
  }

  return (
    <motion.header 
      initial={initial}
      animate={animate}
      transition={transition}
      className="bg-secondary-container border-b border-on-secondary-container/10 shadow-sm sticky top-0 z-50 w-full"
    >
      <div className="flex justify-between items-center w-full px-container-padding py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-full p-1 shadow-sm">
            <img 
              alt="Prabha Signs & Stickers Logo" 
              className="h-10 w-auto object-contain mix-blend-multiply rounded-full" 
              src="https://lh3.googleusercontent.com/aida/ADBb0ugrUCGLx32Vdx6Kg4_lNizPM8j7h1ca6nMu1I--hJfAIByciKOxkgR2oRxHTei6c6fq9L3mV2wamKtszQOWss7M-sZe07lsmlGFU-3sZV9qJhXc_SrDjQlVS34kcsQ9M1RozAvz3tpTPrRqu9CEuPJmw6Jr3FFXwsRnqJWtPsABajVfxbYWd_NsMTRmDHaIltrBdZ3b9kuq0bH9XzH5WMukOGn4f_hgWre_mFFYSFkh15D_er66_6BkB9ZkNynFRy07SU4x74vk"
            />
          </div>
          <span className="text-2xl font-display font-bold text-primary hidden sm:block">Prabha Signs & Stickers</span>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <a className="text-on-secondary-container hover:text-primary transition-colors font-semibold" href="#services">Services</a>
          <a className="text-on-secondary-container hover:text-primary transition-colors font-semibold" href="#gallery">Gallery</a>
          <a className="text-on-secondary-container hover:text-primary transition-colors font-semibold" href="#contact">Contact</a>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-on-secondary-container text-sm font-bold hidden lg:block font-display">98400 77303</span>
          <a 
            className="bg-primary text-white hover:bg-primary-container transition-all active:scale-95 px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-md" 
            href="tel:9840077303"
          >
            <Phone className="w-4 h-4 fill-current" />
            Call Now
          </a>
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  return (
    <section className="relative bg-primary-container text-white py-section-gap px-container-padding overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-grid-gutter">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 text-secondary-fixed px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            <BadgeCheck className="w-4 h-4 text-secondary-container" />
            <span className="text-sm font-bold tracking-wide">Serving Chennai Since 2008</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
            Expert Signage & <br className="hidden lg:block"/>Custom Sticker Solutions in Chennai
          </h1>
          <p className="text-lg text-on-primary-container max-w-2xl leading-relaxed">
            Professional, high-quality, and durable printing services for your business and vehicle needs. We bring your vision to life with precision craftsmanship.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <a 
              className="bg-secondary-fixed text-on-secondary-fixed px-8 py-4 rounded-full text-sm font-bold hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2" 
              href="tel:9840077303"
            >
              <Phone className="w-4 h-4" />
              Call Now: 98400 77303
            </a>
            <a 
              className="border-2 border-outline-variant text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-white/10 transition-colors" 
              href="#services"
            >
              Explore Services
            </a>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full mt-12 md:mt-0"
        >
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 group">
            <img 
              alt="Professional signage fabrication" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCriH3vh_LD6TyzdUxx0mKk1VjzeJUvT7LRQbqY48qcBdjeWWXkwYecKzn666LpR4LwNhMe_giZXGcVqFK7TyZpbFY6_ePV06C3Pfv_9ni0VkcWqWhl598oVaX79YlqqONvNhdv1qkAemK65FR5ukaVLeMYdFUACHe-980V3rZGPuof8HkmJsjnNfhzeynz3eQSu9RlRV5fzQX8AOglaGqcrs8offj_th0RZjK3niv0pOdNALCy82dtINUUxfh_OAhvo2NhWFw70j8"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Services() {
  const serviceCategories = [
    {
      title: "Car and Bike Stickers",
      icon: <Car className="w-6 h-6" />,
      image: "https://lh3.googleusercontent.com/aida/ADBb0ugLOzo4lSM7gtr-WPrVcnjryWBdy2YEzwdv5kbQQqD4q7AaJpj22LNOntzEYCtAyDrXK_kypxdElx39pbBULPolgSI_2ZdR86cw3683r1w6ah_U6JJABDOFc-SYYOa5WBIODkV2zVnXWv1vheREUQC8nkYLKynhLgzjlMcOHOJ2NfjB0EdjazdelsCHCFRZ7JEjy4y1MM1Ucd_KT1k9KgMpczHA09-enotkeELhkRCfyukPaEj6vz7ulEI0OFQQlydvWpn17IbUUg",
      features: ["Custom Number Plates", "Bike Mask Stickering", "Scratch Stickers for Bikes", "Sun Control Film"],
      large: true
    },
    {
      title: "Business Signage",
      icon: <Store className="w-6 h-6" />, 
      image: "https://lh3.googleusercontent.com/aida/ADBb0ugLOzo4lSM7gtr-WPrVcnjryWBdy2YEzwdv5kbQQqD4q7AaJpj22LNOntzEYCtAyDrXK_kypxdElx39pbBULPolgSI_2ZdR86cw3683r1w6ah_U6JJABDOFc-SYYOa5WBIODkV2zVnXWv1vheREUQC8nkYLKynhLgzjlMcOHOJ2NfjB0EdjazdelsCHCFRZ7JEjy4y1MM1Ucd_KT1k9KgMpczHA09-enotkeELhkRCfyukPaEj6vz7ulEI0OFQQlydvWpn17IbUUg",
      features: ["LED Boards", "Vinyl Boards & Digital Banners", "Brass & Steel Letters"],
      large: true
    },
    {
      title: "Office & Identity",
      icon: <Contact className="w-6 h-6" />,
      features: ["Rubber Stamps", "ID Cards & Badges", "Visiting Cards"],
      description: "Professional identity materials to build trust and authority."
    },
    {
      title: "Specialty Printing",
      icon: <Printer className="w-6 h-6" />,
      features: ["Photo Printing", "Shield Stickering"],
      description: "Custom solutions for unique personal and professional needs."
    }
  ];

  return (
    <section className="py-section-gap px-container-padding bg-surface-container-lowest" id="services">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">Our Premium Services</h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">Comprehensive printing and signage solutions tailored for maximum impact and durability.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-grid-gutter">
          {serviceCategories.map((service, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className={`${service.large ? 'lg:col-span-2' : ''} bg-background rounded-2xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-all group`}
            >
              {service.image && (
                <div className="h-48 relative overflow-hidden">
                  <img 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    src={service.image}
                  />
                  <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
                </div>
              )}
              <div className="p-8 relative">
                {!service.image && <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-primary">{service.icon}</span>
                  <h3 className="text-xl md:text-2xl font-display font-semibold text-on-surface">{service.title}</h3>
                </div>
                {service.description && (
                  <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">{service.description}</p>
                )}
                <ul className="space-y-3">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <BadgeCheck className="w-4 h-4 text-secondary-container flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Portfolio() {
  const [stickers, setStickers] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${API_URL}/stickers`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setStickers(res.data);
        } else {
          // Fallback static images
          setStickers([
            { imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBK-bdybKGK1QjmpwA25DvcqyhX88eIgVXS1Sd6m9o1Rn2SiBIrBNPlc0UVCul8Ah84nvpOdMTKUKejq_kuHkIkOauOIb0YQqb_oFLdlszwsMfyKR5-h1nccKgTfNd5mHyeVQl6Cr87qwV1q4XtneM8xg7Ef5fvKH0ETf70Emouqynl1sR2GcxR0eIchlyx_3nfloh_5CTpxcClGh1d30i5NyD4WkoFc122hzUu2EBBXsz8MRNXZD_SVfoMzNLuSKWl08HUf6vIOo0", category: "Car and Bike Stickers" },
            { imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzlC9pg9aRtgLZSGkXF3bUvM-dagjtjGqf2Hh-bENaJC8yriffzOyHDUHikep_g8qzGMOXy8HxLTqUm0IUiEnLT7RiIU8ukHu0F433sqHs6Gnja1qfzBfVHplqhLJicYLJojCVGev_28Voxqne-XrA_gc5xV2ZsgUN3y7U3QOEDWT4K_YQ_R_7rfv_NP-WLdE20jodKEQDVOMVhxjXnhR-P4Banqw8HzxoD8B1DF7lfUfcfiMCpyGEuUmCPpK37T3lO8IeUBfa2SA", category: "Business Signage" },
            { imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFrd0tNHIv2IO41gEP7WCjGt7W-BKI-Mt0lwAgKO4k-hyuioefi_Pf3NyAPvVqBU6waoUMcqsqTZu-iiRYesH3b5kx6VHy4C_61RctkUDc0LHcJBoIKfOKAma2JJkchzETgwCM8M8DIrKj2jhOTerPme3vCdk-D1gigjxojR1G3-paWd-su_5N7DJwyyvcuxw1qtQvhTJuBf2uyGrarjHo5YeUZDqK_n2amhmCQYbudu_3cYm2K_nsG8HC8-TdUAsVttbhKaQxECY", category: "Specialty Items" },
            { imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiuKk3vZjzsehUMSonnSg2TRGlmcHoH3LPGzpQ5GQ5adPWErDd1jWzGisUMAAjvBfSyqfmkEnqiLmx_SUSvq0J0QHFT0ULN_NQUj7bgZRcNYNqPbY4YIoD3tQ0ViAye4DTUU_PQNj92g01fhkIrohQKkBzDeH-8MFfGiAhVfzwIKAQoSQGmdyZGgGl8bGdekzu7TQ5vEMaoiFaZRHZd7F3H7bbR7N1Ridd5BmuYWuey56GsOSwc3_j38RTQHsuGci1Ey6qPdFuFX4", category: "Business Signage" }
          ]);
        }
      })
      .catch(err => {
        console.error("Error fetching stickers:", err);
      });
  }, []);

  return (
    <section className="py-section-gap px-container-padding bg-surface" id="gallery">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">Our Recent Work</h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">A selection of our precision-crafted signage and car and bike sticker projects across Chennai.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stickers.map((img, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden rounded-xl border border-outline-variant aspect-square bg-surface-container"
            >
              <img 
                alt={`${img.category || img.title} - Example ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src={img.imageUrl}
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                <span className="bg-primary/90 text-white px-3 py-1 rounded text-xs font-bold backdrop-blur-sm">
                  {img.category || 'Portfolio'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-white px-container-padding py-16 w-full mt-20" id="contact">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-grid-gutter">
        <div className="flex flex-col gap-6 max-w-sm">
          <div className="flex items-center gap-4 bg-white rounded-full p-1 shadow-inner w-fit">
            <img 
              alt="Prabha Signs & Stickers Logo" 
              className="h-16 w-auto object-contain rounded-full mix-blend-multiply" 
              src="https://lh3.googleusercontent.com/aida/ADBb0ugrUCGLx32Vdx6Kg4_lNizPM8j7h1ca6nMu1I--hJfAIByciKOxkgR2oRxHTei6c6fq9L3mV2wamKtszQOWss7M-sZe07lsmlGFU-3sZV9qJhXc_SrDjQlVS34kcsQ9M1RozAvz3tpTPrRqu9CEuPJmw6Jr3FFXwsRnqJWtPsABajVfxbYWd_NsMTRmDHaIltrBdZ3b9kuq0bH9XzH5WMukOGn4f_hgWre_mFFYSFkh15D_er66_6BkB9ZkNynFRy07SU4x74vk"
            />
          </div>
          <p className="text-on-primary-container leading-relaxed">
            Expert Signage & Custom Sticker Solutions. Delivering quality craftsmanship to Chennai since 2008.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 text-secondary-fixed px-3 py-1.5 rounded-full border border-white/20 w-fit">
            <Star className="w-4 h-4 fill-secondary-container text-secondary-container" />
            <span className="text-xs font-bold">Established 2008</span>
          </div>
        </div>
        <div className="flex flex-col gap-8 md:gap-12">
          <div>
            <h4 className="text-xl font-display font-bold text-secondary-fixed mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-on-primary-container hover:text-secondary-fixed transition-colors">
                <MapPin className="w-5 h-5 mt-1" />
                <span className="max-w-xs leading-relaxed">
                  No: 20 Kamarajar Salai,<br/>
                  Ramapuram, Chennai-600 089
                </span>
              </div>
              <a className="flex items-center gap-3 text-on-primary-container hover:text-secondary-fixed transition-colors" href="tel:9840077303">
                <Phone className="w-5 h-5" />
                <span className="font-bold">98400 77303</span>
              </a>
              <a className="flex items-center gap-3 text-on-primary-container hover:text-secondary-fixed transition-colors" href="mailto:prabhasigns2008@gmail.com">
                <Mail className="w-5 h-5" />
                <span>prabhasigns2008@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center md:text-left">
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} Prabha Signs & Stickers. Established since 2008. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
