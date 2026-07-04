// Catálogo de eventos da plataforma Ingresso Acessível
// Cada evento contém dados realistas + estrutura completa de acessibilidade
import rockinrio from "@/assets/event-rockinrio.jpg";
import lolla from "@/assets/event-lolla.jpg";
import neon from "@/assets/event-neon.jpg";
import indie from "@/assets/event-indie.jpg";

export type TicketTier = {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
};

export type AccessibilityFeature = {
  icon: string;
  label: string;
  description: string;
};

export type EventItem = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  city: string;
  venue: string;
  date: string;          // ISO
  dateLabel: string;     // human
  image: string;
  priceFrom: number;
  description: string;
  lineup: string[];
  schedule: { time: string; act: string; stage: string }[];
  tiers: TicketTier[];
  accessibilityScore: number; // 0-100
  accessibilitySeal: "Altamente Inclusivo" | "Muito Inclusivo" | "Inclusivo";
  accessibility: AccessibilityFeature[];
  mapAreas: { name: string; type: "pcd" | "entrada" | "rampa" | "banheiro" | "descanso" }[];
};

const acFull: AccessibilityFeature[] = [
  { icon: "♿", label: "Rampas de acesso", description: "Rampas em todos os acessos principais com inclinação dentro da NBR 9050." },
  { icon: "🛗", label: "Elevadores", description: "Elevadores acessíveis para áreas elevadas e camarotes." },
  { icon: "👁", label: "Área PCD com visão privilegiada", description: "Plataforma elevada exclusiva para cadeirantes e acompanhante." },
  { icon: "🚻", label: "Banheiros adaptados", description: "Banheiros PNE em todos os setores, sinalizados com piso tátil." },
  { icon: "🤟", label: "Intérprete de Libras", description: "Intérpretes posicionados próximos ao palco principal em todos os shows." },
  { icon: "💬", label: "Legendas em telões", description: "Letras das músicas e falas legendadas em tempo real nos telões." },
  { icon: "🧭", label: "Sinalização e piso tátil", description: "Rotas táteis conectando entrada, banheiros, áreas PCD e saídas de emergência." },
  { icon: "⚡", label: "Entrada prioritária", description: "Fila exclusiva PCD, idosos e gestantes em todas as portarias." },
  { icon: "🅿", label: "Estacionamento acessível", description: "Vagas reservadas próximas das entradas adaptadas." },
  { icon: "🚐", label: "Transporte adaptado", description: "Vans com elevador no embarque/desembarque oficial do evento." },
  { icon: "🌙", label: "Áreas de descanso", description: "Espaços silenciosos com poltronas e iluminação reduzida." },
  { icon: "🎧", label: "Abafadores de ruído", description: "Abafadores gratuitos para pessoas neurodivergentes e crianças." },
  { icon: "👥", label: "Equipe treinada para PCD", description: "Atendentes capacitados em Libras, mobilidade e suporte sensorial." },
];

export const events: EventItem[] = [
  {
    id: "1",
    slug: "rock-in-rio-2026",
    name: "Rock in Rio 2026",
    subtitle: "A maior festival do mundo está de volta",
    city: "Rio de Janeiro, RJ",
    venue: "Parque Olímpico - Barra da Tijuca",
    date: "2026-09-11",
    dateLabel: "11 a 20 de Setembro de 2026",
    image: rockinrio,
    priceFrom: 795,
    description:
      "Sete dias de música em sete palcos com mais de 700 horas de espetáculo. Uma experiência cinematográfica com infraestrutura completa de acessibilidade, gastronomia premium e atrações internacionais inéditas no Brasil.",
    lineup: ["Coldplay", "Foo Fighters", "Imagine Dragons", "Travis Scott", "Anitta", "Iron Maiden", "Billie Eilish", "Skrillex"],
    schedule: [
      { time: "14:00", act: "Abertura dos portões", stage: "Cidade do Rock" },
      { time: "16:00", act: "Banda Local Convidada", stage: "Sunset" },
      { time: "18:30", act: "Imagine Dragons", stage: "Palco Mundo" },
      { time: "21:00", act: "Coldplay", stage: "Palco Mundo" },
      { time: "23:30", act: "Skrillex", stage: "New Dance Order" },
    ],
    tiers: [
      { id: "pista", name: "Pista", description: "Acesso à área geral, em pé", price: 795, available: true },
      { id: "pista-premium", name: "Pista Premium", description: "Área frontal exclusiva", price: 1590, available: true },
      { id: "camarote", name: "Camarote Mundo", description: "Open bar + open food", price: 3290, available: true },
      { id: "pcd", name: "PCD + Acompanhante", description: "Plataforma exclusiva com visão privilegiada", price: 397.50, available: true },
    ],
    accessibilityScore: 96,
    accessibilitySeal: "Altamente Inclusivo",
    accessibility: acFull,
    mapAreas: [
      { name: "Entrada Norte (Acessível)", type: "entrada" },
      { name: "Plataforma PCD - Palco Mundo", type: "pcd" },
      { name: "Rampa Setor 2", type: "rampa" },
      { name: "Banheiro Adaptado A", type: "banheiro" },
      { name: "Área de Descanso Sensorial", type: "descanso" },
    ],
  },
  {
    id: "2",
    slug: "lollapalooza-brasil-2027",
    name: "Lollapalooza Brasil 2027",
    subtitle: "Três dias, quatro palcos, infinitas memórias",
    city: "São Paulo, SP",
    venue: "Autódromo de Interlagos",
    date: "2027-03-26",
    dateLabel: "26, 27 e 28 de Março de 2027",
    image: lolla,
    priceFrom: 685,
    description:
      "O Lollapalooza retorna a Interlagos com line-up que mistura pop, indie, rock alternativo e eletrônico. Estrutura totalmente repensada com foco em sustentabilidade e experiência inclusiva.",
    lineup: ["Olivia Rodrigo", "The Strokes", "Tame Impala", "Doja Cat", "Liniker", "Pabllo Vittar", "Arctic Monkeys"],
    schedule: [
      { time: "12:00", act: "Portões abertos", stage: "Geral" },
      { time: "15:30", act: "Liniker", stage: "Budweiser" },
      { time: "18:00", act: "Tame Impala", stage: "Skol" },
      { time: "21:00", act: "Olivia Rodrigo", stage: "Budweiser" },
    ],
    tiers: [
      { id: "daily", name: "Lolla Day", description: "Ingresso para um dia", price: 685, available: true },
      { id: "pass", name: "Lolla Pass", description: "Acesso aos três dias", price: 1690, available: true },
      { id: "lounge", name: "Lolla Lounge", description: "Área premium com open bar", price: 2890, available: false },
      { id: "pcd", name: "PCD + Acompanhante", description: "Plataforma exclusiva", price: 342.50, available: true },
    ],
    accessibilityScore: 92,
    accessibilitySeal: "Altamente Inclusivo",
    accessibility: acFull.slice(0, 12),
    mapAreas: [
      { name: "Entrada PCD - Portão 12", type: "entrada" },
      { name: "Plataforma PCD - Palco Budweiser", type: "pcd" },
      { name: "Banheiro Adaptado B", type: "banheiro" },
    ],
  },
  {
    id: "3",
    slug: "neonwave-festival-2026",
    name: "NeonWave Festival 2026",
    subtitle: "Eletrônica imersiva em 360°",
    city: "Florianópolis, SC",
    venue: "Arena Marítima",
    date: "2026-11-14",
    dateLabel: "14 de Novembro de 2026",
    image: neon,
    priceFrom: 420,
    description:
      "Festival exclusivo de música eletrônica com mapeamento 3D, palcos imersivos e produção visual cinematográfica. Pioneiro em recursos sensoriais reduzidos para neurodivergentes.",
    lineup: ["Charlotte de Witte", "Tale of Us", "Vintage Culture", "Alok", "Anyma"],
    schedule: [
      { time: "20:00", act: "Open: Anyma", stage: "Main Dome" },
      { time: "22:00", act: "Vintage Culture", stage: "Main Dome" },
      { time: "00:30", act: "Charlotte de Witte", stage: "Underground" },
    ],
    tiers: [
      { id: "geral", name: "Geral", description: "Acesso à arena principal", price: 420, available: true },
      { id: "vip", name: "VIP Glow", description: "Área elevada + open drinks", price: 980, available: true },
      { id: "pcd", name: "PCD + Acompanhante", description: "Área PCD silenciosa", price: 210, available: true },
    ],
    accessibilityScore: 88,
    accessibilitySeal: "Muito Inclusivo",
    accessibility: acFull.filter((f) => f.label !== "Transporte adaptado"),
    mapAreas: [
      { name: "Entrada Acessível", type: "entrada" },
      { name: "Área PCD Silenciosa", type: "pcd" },
      { name: "Sala de Descanso Sensorial", type: "descanso" },
    ],
  },
  {
    id: "4",
    slug: "indie-nights-2026",
    name: "Indie Nights",
    subtitle: "Intimismo, autoria e som artesanal",
    city: "Belo Horizonte, MG",
    venue: "Teatro Vivo - Savassi",
    date: "2026-08-22",
    dateLabel: "22 de Agosto de 2026",
    image: indie,
    priceFrom: 180,
    description:
      "Uma noite curada com nomes essenciais da nova cena indie brasileira. Teatro climatizado, acústica de referência e experiência sensorial cuidadosamente desenhada.",
    lineup: ["Marina Sena", "Tuyo", "Letrux", "Bala Desejo"],
    schedule: [
      { time: "19:00", act: "Abertura", stage: "Sala Principal" },
      { time: "20:00", act: "Tuyo", stage: "Sala Principal" },
      { time: "22:00", act: "Marina Sena", stage: "Sala Principal" },
    ],
    tiers: [
      { id: "plateia", name: "Plateia", description: "Assento numerado", price: 180, available: true },
      { id: "frisa", name: "Frisa", description: "Camarote intimista", price: 360, available: true },
      { id: "pcd", name: "PCD + Acompanhante", description: "Assento adaptado", price: 90, available: true },
    ],
    accessibilityScore: 84,
    accessibilitySeal: "Muito Inclusivo",
    accessibility: acFull.slice(0, 10),
    mapAreas: [
      { name: "Entrada Principal Acessível", type: "entrada" },
      { name: "Assentos PCD Fila A", type: "pcd" },
      { name: "Banheiro PNE Térreo", type: "banheiro" },
    ],
  },
];

export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
