# Student Portal - ERP System

A complete parent-student portal for school ERP system with fees management, academic records, homework tracking, and more.

## 🚀 Features

- **Authentication**: Login using SR Number and Class
- **Dashboard**: Overview of student information and quick stats
- **Fee Management**: View pending fees, payment history, and online payment
- **Academic Records**: Exam results, grades, and report cards
- **Homework**: Assignment tracking and submission
- **Notices & Notifications**: School announcements and personal alerts
- **Profile Management**: Student information and updates

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account and project

## ⚙️ Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://lrsffguycbuvzrjzevsm.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Run the SQL to create all necessary tables and sample data

### 3. Storage Setup

1. In Supabase dashboard, go to Storage
2. The `homework-submissions` bucket will be created automatically
3. Ensure the bucket is public for file uploads

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

## 🗄️ Database Schema

### Tables Created:
- `students` - Student information and profiles
- `fee_records` - Fee management and payment tracking
- `exam_records` - Academic performance and grades
- `homework` - Assignment management and submissions
- `notices` - School-wide announcements
- `notifications` - Student-specific alerts

### Sample Login Credentials:
- **SR Number**: 15
- **Class**: 10th

## 🔐 Authentication Flow

1. Student enters SR Number (Roll Number) and Class
2. System validates credentials against Supabase database
3. On successful login, generates token and fetches student data
4. All subsequent API calls use the authentication token

## 💳 Payment Integration

The fee payment system includes:
- Real-time payment processing
- Transaction ID generation
- SMS confirmation simulation
- Payment history tracking
- Automatic status updates

## 📁 File Upload

Homework submission supports:
- PDF, DOC, DOCX, TXT files
- File size limit: 10MB
- Secure storage in Supabase Storage
- Automatic file URL generation

## 🔔 Notification System

- Real-time notifications for payments, submissions, and announcements
- Mark as read functionality
- Categorized by type (info, warning, success, error)
- Automatic notification creation for system events

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Indian Localization**: INR currency, Indian date formats
- **Modern Interface**: Clean, professional design
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly interface
- Mobile navigation menu
- Optimized for small screens

## 🔒 Security Features

- Row Level Security (RLS) enabled
- Secure file uploads
- Token-based authentication
- Input validation and sanitization

## 🚀 Deployment

The application is ready for deployment to platforms like:
- Vercel
- Netlify
- Heroku
- Any static hosting service

## 📞 Support

For technical support or questions about the ERP system, contact your school administrator.

## 📄 License

This project is proprietary software for educational institutions.