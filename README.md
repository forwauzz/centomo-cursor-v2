# CentomoMD V2 - Medical Documentation Platform

A professional, secure, and compliant medical documentation platform built for healthcare providers in Quebec. Built with Next.js 14, TypeScript, and Supabase.

## 🏥 Features

- **Secure Patient Records**: End-to-end encrypted patient data management
- **Voice Dictation**: AI-powered speech-to-text with medical terminology recognition
- **Real-time Collaboration**: Multi-user support with role-based access control
- **Compliance Ready**: PIPEDA and HIPAA compliant with comprehensive audit trails
- **Quebec Healthcare**: Tailored for Quebec healthcare system with French language support
- **Professional UI**: Medical-themed design with accessibility features

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with medical theme
- **UI Components**: shadcn/ui with Radix UI primitives
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd centomomd-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The application uses Supabase with the following main tables:

- `users` - Healthcare providers and staff
- `patients` - Patient information and demographics
- `medical_records` - Medical documentation and notes
- `appointments` - Patient appointments and scheduling
- `audit_logs` - Security and compliance audit trails
- `voice_recordings` - Voice dictation recordings and transcriptions
- `notifications` - System notifications and alerts

## 🎨 Design System

### Colors
- **Primary**: Medical Blue (#0066CC)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

### Typography
- **Font**: Inter (Google Fonts)
- **Medical-specific styling** for healthcare professionals

## 🔒 Security & Compliance

- **Encryption**: End-to-end encryption for all patient data
- **Audit Trails**: Comprehensive logging of all data access
- **Access Control**: Role-based permissions (Admin, Doctor, Nurse, Receptionist)
- **Data Retention**: Configurable retention policies (default: 7 years)
- **PIPEDA Compliance**: Canadian privacy law compliance
- **HIPAA Compliance**: US healthcare privacy standards

## 📱 Features

### Core Functionality
- Patient registration and management
- Medical record creation and editing
- Voice dictation with transcription
- Appointment scheduling
- Real-time notifications
- File upload and management

### Advanced Features
- Multi-language support (English/French)
- Offline capability
- Mobile-responsive design
- Print-friendly medical documents
- Export functionality
- Search and filtering

## 🏗️ Project Structure

```
centomomd-v2/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers.tsx     # Context providers
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
├── types/                # TypeScript definitions
│   └── supabase.ts       # Database types
├── hooks/                # Custom React hooks
└── docs/                 # Documentation
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm run format` - Format code with Prettier

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔮 Roadmap

- [ ] Advanced voice dictation with medical AI
- [ ] Integration with Quebec health systems
- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support for clinics
- [ ] API for third-party integrations

## 🙏 Acknowledgments

- Built for healthcare professionals in Quebec
- Designed with accessibility and usability in mind
- Compliant with healthcare privacy regulations
- Powered by modern web technologies

---

**Built with ❤️ for the healthcare community**
