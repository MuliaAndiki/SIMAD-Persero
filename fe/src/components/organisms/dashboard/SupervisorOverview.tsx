import { StatCard } from '@/components/organisms/dashboard/StatCard';
import type { SupervisorDashboardData } from '@/types/api/dashboard.types';
import { type Variants, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, Users } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

/**
 * SupervisorOverview — ringkasan dashboard supervisor (GET /dashboard/supervisor).
 * Presentasi murni; data disuplai oleh section/container.
 */
export function SupervisorOverview({
  data,
}: {
  data: SupervisorDashboardData;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all">
        <StatCard
          icon={Users}
          label="Peserta Departemen"
          value={data.departmentParticipants}
          description="Peserta magang"
          className="border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] bg-gradient-to-br from-card to-blue-500/5"
          tone="primary"
        />
      </motion.div>
      <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all">
        <StatCard
          icon={CheckCircle2}
          label="Hadir"
          value={data.present}
          description="Sudah check-in"
          className="border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] bg-gradient-to-br from-card to-emerald-500/5"
        />
      </motion.div>
      <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all">
        <StatCard
          icon={Clock}
          label="Belum Check-in"
          value={data.notCheckedIn}
          description="Belum hadir"
          className="border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] bg-gradient-to-br from-card to-amber-500/5"
        />
      </motion.div>
      <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all">
        <StatCard
          icon={AlertTriangle}
          label="Absensi Tidak Valid"
          value={data.invalidAttendance}
          description="Perlu ditinjau"
          className="border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)] bg-gradient-to-br from-card to-rose-500/5"
        />
      </motion.div>
    </motion.div>
  );
}
