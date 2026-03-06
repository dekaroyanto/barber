"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import {
  Scissors,
  Clock,
  Star,
  ChevronRightIcon,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getBarbers } from "@/services/home";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState([]);

  // Data statis untuk services
  const services = [
    {
      name: "Haircut & Fade",
      price: "Rp 80K",
      duration: "45 min",
      description: "Potongan rambut dengan teknik fade terbaik",
    },
    {
      name: "Beard Grooming",
      price: "Rp 50K",
      duration: "30 min",
      description: "Rapikan dan styling janggut sesuai keinginan",
    },
    {
      name: "Haircut + Beard",
      price: "Rp 120K",
      duration: "60 min",
      description: "Paket lengkap rambut dan janggut",
    },
    {
      name: "Kids Haircut",
      price: "Rp 60K",
      duration: "30 min",
      description: "Potongan rambut khusus untuk anak-anak",
    },
    {
      name: "Hair Tattoo",
      price: "Rp 100K",
      duration: "45 min",
      description: "Desain motif pada rambut dengan fade",
    },
    {
      name: "Royal Treatment",
      price: "Rp 200K",
      duration: "90 min",
      description: "Haircut + Beard + Creambath + Masker",
    },
  ];

  // Data statis untuk testimonials
  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Regular Customer",
      comment:
        "Pelayanan terbaik di kota! Fade-nya rapi dan barbernya sangat profesional. Recommended banget!",
      rating: 5,
    },
    {
      name: "Ahmad Rizki",
      role: "New Customer",
      comment:
        "Pertama kali coba, hasilnya memuaskan. Suasananya nyaman dan barbernya ramah.",
      rating: 5,
    },
    {
      name: "Dwi Prasetyo",
      role: "Customer 3+ tahun",
      comment:
        "Udah langganan dari buka, gak pernah pindah tempat lain. Kualitasnya konsisten!",
      rating: 5,
    },
  ];

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    setLoading(true);
    try {
      // Hanya ambil data barbers dari Supabase
      const { data, error } = await getBarbers();
      if (error) throw error;
      if (data) setBarbers(data);
    } catch (error) {
      console.error("Error loading barbers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-900 via-stone-900 to-zinc-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-950 to-stone-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Scissors className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold text-white">
                <span className="text-amber-500">FADE</span> BARBERSHOP
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="text-zinc-300 hover:text-amber-500 transition-colors"
              >
                Home
              </a>
              <a
                href="#services"
                className="text-zinc-300 hover:text-amber-500 transition-colors"
              >
                Layanan
              </a>
              <a
                href="#barbers"
                className="text-zinc-300 hover:text-amber-500 transition-colors"
              >
                Barbers
              </a>
              <a
                href="#testimonials"
                className="text-zinc-300 hover:text-amber-500 transition-colors"
              >
                Testimoni
              </a>
              <a
                href="#contact"
                className="text-zinc-300 hover:text-amber-500 transition-colors"
              >
                Kontak
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-zinc-300 hover:text-amber-500 hover:bg-zinc-800"
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white">
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden pt-16"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/75"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-linear-to-br from-amber-600/20 to-amber-500/20 rounded-full border border-amber-500/30 backdrop-blur">
                <Scissors className="h-16 w-16 text-amber-500" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                FADE BARBERSHOP
              </span>
            </h1>

            <p className="text-xl text-zinc-300 mb-8">
              Lebih dari sekadar potong rambut. Nikmati layanan grooming premium
              dengan sentuhan profesional
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/customer/home">
                <Button
                  size="lg"
                  className="bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-8"
                >
                  Booking Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-400 animate-bounce">
          <ChevronRightIcon className="h-6 w-6 rotate-90" />
        </div>
      </section>

      {/* Services Section - Data Statis */}
      <section id="services" className="py-20 px-4 bg-zinc-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Layanan <span className="text-amber-500">Kami</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Berbagai pilihan layanan untuk memenuhi kebutuhan gaya rambut Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="bg-zinc-800/50 border-zinc-700 hover:border-amber-500/50 transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-white flex justify-between items-center">
                    <span>{service.name}</span>
                    <span className="text-amber-500 text-lg">
                      {service.price}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-zinc-300 text-sm">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    Durasi: {service.duration}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Barbers Section - Data dari Supabase */}
      <section id="barbers" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tim <span className="text-amber-500">Barber</span> Kami
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Ditangani oleh barber profesional berpengalaman
            </p>
          </div>

          {barbers.length === 0 ? (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Scissors className="h-12 w-12 text-zinc-600 mb-4" />
                <p className="text-zinc-400 text-center">
                  Belum ada barber tersedia
                </p>
              </CardContent>
            </Card>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {barbers.map((barber) => (
                  <CarouselItem
                    key={barber.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="group bg-zinc-800/50 border-zinc-700 hover:border-amber-500/50 transition-all duration-300 cursor-pointer overflow-hidden">
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={
                            barber.image ||
                            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                          }
                          alt={barber.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-contain group-hover:scale-110 transition-transform duration-500"
                          style={{ objectPosition: "center" }}
                          priority={false}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className="bg-amber-500/90 text-white border-0"
                            >
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {barber.rating || "5.0"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-black/50 text-white border-zinc-600"
                            >
                              {barber.total_bookings || 0} bookings
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-white group-hover:text-amber-500 transition-colors">
                          {barber.name}
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          {barber.specialty || "Master Barber"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p className="text-zinc-400">
                            Pengalaman: {barber.experience || 5}+ tahun
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href="/customer/home" className="w-full">
                          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                            Booking Sekarang
                            <ChevronRightIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex -left-4 bg-zinc-800 border-zinc-700 text-white hover:bg-amber-500 hover:text-white" />
              <CarouselNext className="hidden sm:flex -right-4 bg-zinc-800 border-zinc-700 text-white hover:bg-amber-500 hover:text-white" />
            </Carousel>
          )}
        </div>
      </section>

      {/* Testimonials Section - Data Statis */}
      <section id="testimonials" className="py-20 px-4 bg-zinc-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Apa Kata <span className="text-amber-500">Pelanggan</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Kepercayaan dan kepuasan pelanggan adalah prioritas utama kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-500 text-amber-500"
                      />
                    ))}
                  </div>
                  <CardTitle className="text-white">
                    {testimonial.name}
                  </CardTitle>
                  <CardDescription className="text-amber-500/70">
                    {testimonial.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 italic">
                    "{testimonial.comment}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-amber-600/20 to-amber-500/20"></div>
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Tampil <span className="text-amber-500">Keren?</span>
          </h2>
          <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
            Booking sekarang dan dapatkan potongan rambut terbaik dari barber
            profesional kami
          </p>
          <Link href="/customer/home">
            <Button
              size="lg"
              className="bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-12 py-6 text-lg"
            >
              Booking Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-zinc-950 border-t border-zinc-800 py-12 px-4"
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scissors className="h-6 w-6 text-amber-500" />
                <span className="text-xl font-bold text-white">
                  <span className="text-amber-500">FADE</span> BARBERSHOP
                </span>
              </div>
              <p className="text-zinc-400 text-sm">
                Lebih dari sekadar potong rambut. Nikmati layanan grooming
                premium dengan sentuhan profesional.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Jam Operasional</h3>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li>Senin - Jumat: 10:00 - 21:00</li>
                <li>Sabtu: 09:00 - 22:00</li>
                <li>Minggu: 12:00 - 20:00</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  Jl. Gunung galunggung No.19, Kota Cirebon
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-500" />
                  +62 821-1877-5378
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-500" />
                  info@fadebarbershop.com
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Ikuti Kami</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/awal_barbershop/"
                  className="text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                {/* <a
                  href="#"
                  className="text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a> */}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-500 text-sm">
            <p>&copy; 2024 FADE Barbershop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
