"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  getText: (en: string, fr: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Comprehensive translations for all dashboard elements
const translations = {
  en: {
    // Dashboard Headers
    'dashboard.welcome': 'Welcome back',
    'dashboard.manage_docs': 'Manage your medical documentation and patient reports',
    'admin.dashboard': 'Admin Dashboard',
    'admin.system_admin': 'System administration and platform management',
    
    // Statistics Cards
    'stats.total_forms': 'Total Forms',
    'stats.completed': 'Completed',
    'stats.drafts': 'Drafts',
    'stats.voice_accuracy': 'Voice Accuracy',
    'stats.total_users': 'Total Users',
    'stats.system_health': 'System Health',
    'stats.ai_training': 'AI Training',
    'stats.this_month': 'this month',
    'stats.completion_rate': 'completion rate',
    'stats.pending_completion': 'Pending completion',
    'stats.ai_accuracy': 'AI transcription accuracy',
    'stats.active_users': 'active users',
    'stats.medical_reports': 'Medical reports created',
    'stats.all_systems': 'All systems operational',
    'stats.model_accuracy': 'Model accuracy',
    
    // Voice Recording Status
    'voice.status': 'Voice Recording Status',
    'voice.real_time': 'Real-time voice dictation system status and quality monitoring',
    'voice.connection': 'Connection',
    'voice.recording': 'Recording',
    'voice.audio_quality': 'Audio Quality',
    'voice.device': 'Device',
    'voice.connected': 'Connected',
    'voice.disconnected': 'Disconnected',
    'voice.active': 'Active',
    'voice.inactive': 'Inactive',
    'voice.microphone_ready': 'Microphone Ready',
    'voice.no_device': 'No Device',
    'voice.start_recording': 'Start Recording',
    'voice.stop_recording': 'Stop Recording',
    'voice.settings': 'Voice Settings',
    
    // Quick Actions
    'actions.quick_actions': 'Quick Actions',
    'actions.medical_workflow': 'Common tasks and shortcuts for your medical workflow',
    'actions.new_form': 'New Form',
    'actions.create_cnesst': 'Create a new CNESST report',
    'actions.view_drafts': 'View Drafts',
    'actions.continue_drafts': 'Continue working on drafts',
    'actions.export_reports': 'Export Reports',
    'actions.download_forms': 'Download completed forms',
    'actions.voice_recording': 'Voice Recording',
    'actions.start_dictation': 'Start voice dictation',
    'actions.primary': 'Primary',
    'actions.recent': 'Recent',
    'actions.pending': 'pending',
    
    // Recent Forms
    'forms.recent_forms': 'Recent Forms',
    'forms.latest_work': 'Your latest medical documentation work',
    'forms.view_all': 'View All Forms',
    'forms.completed': 'Completed',
    'forms.draft': 'Draft',
    'forms.in_progress': 'In Progress',
    'forms.unknown': 'Unknown',
    
    // Export History
    'exports.history': 'Export History',
    'exports.recent_exports': 'Recently exported medical reports and documents',
    'exports.view_all': 'View All Exports',
    'exports.processing': 'Processing',
    'exports.failed': 'Failed',
    
    // System Status
    'system.status': 'System Status',
    'system.platform_health': 'Platform health and compliance status for medical documentation',
    'system.voice_processing': 'Voice Processing',
    'system.ai_services': 'AI Services',
    'system.database': 'Database',
    'system.compliance': 'Compliance',
    'system.wcag_compliant': 'WCAG 2.1 Compliant • Quebec Law 25 Certified • Medical Grade Security',
    
    // Admin Dashboard Specific
    'admin.refresh': 'Refresh',
    'admin.invite_user': 'Invite User',
    'admin.system_performance': 'System Performance',
    'admin.real_time_metrics': 'Real-time system metrics and resource utilization',
    'admin.cpu_usage': 'CPU Usage',
    'admin.memory_usage': 'Memory Usage',
    'admin.disk_usage': 'Disk Usage',
    'admin.network_latency': 'Network Latency',
    'admin.active_connections': 'Active Connections',
    'admin.uptime': 'Uptime',
    
    // AI Training System
    'ai.training_system': 'AI Training System',
    'ai.ml_training': 'Machine learning model training and performance monitoring',
    'ai.model_status': 'Model Status',
    'ai.accuracy': 'Accuracy',
    'ai.dataset_size': 'Dataset Size',
    'ai.last_training': 'Last Training',
    'ai.start_training': 'Start Training',
    'ai.stop_training': 'Stop Training',
    'ai.training_settings': 'Training Settings',
    'ai.export_model': 'Export Model',
    
    // Administrative Actions
    'admin.actions': 'Administrative Actions',
    'admin.system_management': 'Quick access to administrative functions and system management',
    'admin.user_management': 'User Management',
    'admin.manage_accounts': 'Manage user accounts and permissions',
    'admin.ai_training': 'AI Training',
    'admin.improve_ai': 'Train and improve AI documentation',
    'admin.analytics': 'Analytics',
    'admin.view_analytics': 'View system analytics and reports',
    'admin.system_settings': 'System Settings',
    'admin.configure_platform': 'Configure platform settings',
    'admin.users': 'users',
    'admin.live': 'Live',
    
    // Platform Analytics
    'analytics.platform': 'Platform Analytics',
    'analytics.kpi': 'Key performance indicators and user engagement metrics',
    'analytics.active_users': 'Active Users',
    'analytics.last_30_days': 'Last 30 days',
    'analytics.forms_this_month': 'Forms This Month',
    'analytics.cnesst_reports': 'CNESST reports',
    'analytics.avg_completion': 'Avg. Completion Time',
    'analytics.per_form': 'Per form',
    'analytics.user_satisfaction': 'User Satisfaction',
    'analytics.rating_out_of_5': 'Rating out of 5',
    'analytics.from_last_month': 'from last month',
    
    // Recent Users
    'users.recent_users': 'Recent Users',
    'users.registrations': 'Latest user registrations and account activity',
    'users.view_all': 'View All Users',
    'users.active': 'Active',
    'users.pending': 'Pending',
    'users.inactive': 'Inactive',
    
    // Audit Logs
    'audit.logs': 'Recent Audit Logs',
    'audit.system_activity': 'System activity and user action tracking',
    'audit.view_all': 'View All Logs',
    'audit.low': 'LOW',
    'audit.medium': 'MEDIUM',
    'audit.high': 'HIGH',
    'audit.critical': 'CRITICAL',
    
    // System Alerts
    'alerts.system_alerts': 'System Alerts',
    'alerts.notifications': 'Recent system notifications and events',
    'alerts.view_all': 'View All Alerts',
    
    // Enhanced System Status
    'system.enhanced_status': 'System Status',
    'system.service_monitoring': 'Platform health and service status monitoring',
    'system.operational': 'Operational',
    'system.online': 'Online',
    'system.available': 'Available',
    'system.active': 'Active',
    'system.hipaa_compliant': 'HIPAA Compliant • Quebec Law 25 Certified • SOC 2 Type II • Medical Grade Security',
    
    // Buttons and Actions
    'buttons.new_form': 'New Form',
    'buttons.view_drafts': 'View Drafts',
    'buttons.export_reports': 'Export Reports',
    'buttons.voice_recording': 'Voice Recording',
    'buttons.refresh': 'Refresh',
    'buttons.invite_user': 'Invite User',
    'buttons.start_training': 'Start Training',
    'buttons.stop_training': 'Stop Training',
    'buttons.training_settings': 'Training Settings',
    'buttons.export_model': 'Export Model',
    'buttons.view_all_forms': 'View All Forms',
    'buttons.view_all_exports': 'View All Exports',
    'buttons.view_all_users': 'View All Users',
    'buttons.view_all_logs': 'View All Logs',
    'buttons.view_all_alerts': 'View All Alerts',
    
    // Status Messages
    'status.auto_saved': 'Auto-saved 2 min ago',
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.excellent': 'excellent',
    'status.good': 'good',
    'status.poor': 'poor',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.admin_dashboard': 'Admin Dashboard',
    'nav.user_management': 'User Management',
    'nav.ai_training': 'AI Training',
    'nav.analytics': 'Analytics',
    'nav.new_form': 'New Form',
    'nav.drafts': 'Drafts',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Form Sections
    'sections.patient_info': 'Patient Information',
    'sections.physician_info': 'Physician Information',
    'sections.report_overview': 'Report Overview',
    'sections.identification': 'Identification & Background',
    'sections.medical_history': 'Medical History',
    'sections.current_treatment': 'Current Treatment',
    'sections.physical_exam': 'Physical Examination',
    'sections.subjective_assessment': 'Subjective Assessment',
    'sections.physical_tables': 'Physical Exam Tables',
    'sections.additional_tests': 'Additional Tests',
    'sections.medical_conclusions': 'Medical Conclusions',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.refresh': 'Refresh',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.finish': 'Finish',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    'common.clear': 'Clear',
    'common.select': 'Select',
    'common.choose': 'Choose',
    'common.browse': 'Browse',
    'common.upload_file': 'Upload File',
    'common.download_file': 'Download File',
    'common.view_details': 'View Details',
    'common.hide_details': 'Hide Details',
    'common.expand': 'Expand',
    'common.collapse': 'Collapse',
    'common.show_more': 'Show More',
    'common.show_less': 'Show Less',
    'common.select_all': 'Select All',
    'common.deselect_all': 'Deselect All',
    'common.select_none': 'Select None',
    'common.select_inverse': 'Select Inverse',
    'common.select_page': 'Select Page',
    'common.deselect_page': 'Deselect Page',
    'common.select_range': 'Select Range',
    'common.deselect_range': 'Deselect Range',
  },
  fr: {
    // Dashboard Headers
    'dashboard.welcome': 'Bon retour',
    'dashboard.manage_docs': 'Gérez votre documentation médicale et vos rapports de patients',
    'admin.dashboard': 'Tableau de bord admin',
    'admin.system_admin': 'Administration système et gestion de plateforme',
    
    // Statistics Cards
    'stats.total_forms': 'Total des formulaires',
    'stats.completed': 'Terminés',
    'stats.drafts': 'Brouillons',
    'stats.voice_accuracy': 'Précision vocale',
    'stats.total_users': 'Total des utilisateurs',
    'stats.system_health': 'Santé du système',
    'stats.ai_training': 'Formation IA',
    'stats.this_month': 'ce mois-ci',
    'stats.completion_rate': 'taux de completion',
    'stats.pending_completion': 'En attente de completion',
    'stats.ai_accuracy': 'Précision de transcription IA',
    'stats.active_users': 'utilisateurs actifs',
    'stats.medical_reports': 'Rapports médicaux créés',
    'stats.all_systems': 'Tous les systèmes opérationnels',
    'stats.model_accuracy': 'Précision du modèle',
    
    // Voice Recording Status
    'voice.status': 'Statut d\'enregistrement vocal',
    'voice.real_time': 'Statut en temps réel du système de dictée vocale et surveillance de la qualité',
    'voice.connection': 'Connexion',
    'voice.recording': 'Enregistrement',
    'voice.audio_quality': 'Qualité audio',
    'voice.device': 'Appareil',
    'voice.connected': 'Connecté',
    'voice.disconnected': 'Déconnecté',
    'voice.active': 'Actif',
    'voice.inactive': 'Inactif',
    'voice.microphone_ready': 'Microphone prêt',
    'voice.no_device': 'Aucun appareil',
    'voice.start_recording': 'Commencer l\'enregistrement',
    'voice.stop_recording': 'Arrêter l\'enregistrement',
    'voice.settings': 'Paramètres vocaux',
    
    // Quick Actions
    'actions.quick_actions': 'Actions rapides',
    'actions.medical_workflow': 'Tâches communes et raccourcis pour votre flux de travail médical',
    'actions.new_form': 'Nouveau formulaire',
    'actions.create_cnesst': 'Créer un nouveau rapport CNESST',
    'actions.view_drafts': 'Voir les brouillons',
    'actions.continue_drafts': 'Continuer à travailler sur les brouillons',
    'actions.export_reports': 'Exporter les rapports',
    'actions.download_forms': 'Télécharger les formulaires terminés',
    'actions.voice_recording': 'Enregistrement vocal',
    'actions.start_dictation': 'Commencer la dictée vocale',
    'actions.primary': 'Principal',
    'actions.recent': 'Récent',
    'actions.pending': 'en attente',
    
    // Recent Forms
    'forms.recent_forms': 'Formulaires récents',
    'forms.latest_work': 'Votre dernier travail de documentation médicale',
    'forms.view_all': 'Voir tous les formulaires',
    'forms.completed': 'Terminé',
    'forms.draft': 'Brouillon',
    'forms.in_progress': 'En cours',
    'forms.unknown': 'Inconnu',
    
    // Export History
    'exports.history': 'Historique d\'export',
    'exports.recent_exports': 'Rapports médicaux et documents exportés récemment',
    'exports.view_all': 'Voir tous les exports',
    'exports.processing': 'En cours',
    'exports.failed': 'Échoué',
    
    // System Status
    'system.status': 'Statut du système',
    'system.platform_health': 'Santé de la plateforme et statut de conformité pour la documentation médicale',
    'system.voice_processing': 'Traitement vocal',
    'system.ai_services': 'Services IA',
    'system.database': 'Base de données',
    'system.compliance': 'Conformité',
    'system.wcag_compliant': 'Conforme WCAG 2.1 • Certifié Loi 25 Québec • Sécurité de niveau médical',
    
    // Admin Dashboard Specific
    'admin.refresh': 'Actualiser',
    'admin.invite_user': 'Inviter un utilisateur',
    'admin.system_performance': 'Performance système',
    'admin.real_time_metrics': 'Métriques système en temps réel et utilisation des ressources',
    'admin.cpu_usage': 'Utilisation CPU',
    'admin.memory_usage': 'Utilisation mémoire',
    'admin.disk_usage': 'Utilisation disque',
    'admin.network_latency': 'Latence réseau',
    'admin.active_connections': 'Connexions actives',
    'admin.uptime': 'Temps de fonctionnement',
    
    // AI Training System
    'ai.training_system': 'Système de formation IA',
    'ai.ml_training': 'Formation de modèle d\'apprentissage automatique et surveillance des performances',
    'ai.model_status': 'Statut du modèle',
    'ai.accuracy': 'Précision',
    'ai.dataset_size': 'Taille du jeu de données',
    'ai.last_training': 'Dernière formation',
    'ai.start_training': 'Commencer la formation',
    'ai.stop_training': 'Arrêter la formation',
    'ai.training_settings': 'Paramètres de formation',
    'ai.export_model': 'Exporter le modèle',
    
    // Administrative Actions
    'admin.actions': 'Actions administratives',
    'admin.system_management': 'Accès rapide aux fonctions administratives et à la gestion système',
    'admin.user_management': 'Gestion des utilisateurs',
    'admin.manage_accounts': 'Gérer les comptes utilisateurs et les permissions',
    'admin.ai_training': 'Formation IA',
    'admin.improve_ai': 'Former et améliorer la documentation IA',
    'admin.analytics': 'Analyses',
    'admin.view_analytics': 'Voir les analyses système et rapports',
    'admin.system_settings': 'Paramètres système',
    'admin.configure_platform': 'Configurer les paramètres de plateforme',
    'admin.users': 'utilisateurs',
    'admin.live': 'En direct',
    
    // Platform Analytics
    'analytics.platform': 'Analyses de plateforme',
    'analytics.kpi': 'Indicateurs de performance clés et métriques d\'engagement utilisateur',
    'analytics.active_users': 'Utilisateurs actifs',
    'analytics.last_30_days': '30 derniers jours',
    'analytics.forms_this_month': 'Formulaires ce mois-ci',
    'analytics.cnesst_reports': 'Rapports CNESST',
    'analytics.avg_completion': 'Temps moyen de completion',
    'analytics.per_form': 'Par formulaire',
    'analytics.user_satisfaction': 'Satisfaction utilisateur',
    'analytics.rating_out_of_5': 'Note sur 5',
    'analytics.from_last_month': 'du mois dernier',
    
    // Recent Users
    'users.recent_users': 'Utilisateurs récents',
    'users.registrations': 'Dernières inscriptions utilisateur et activité de compte',
    'users.view_all': 'Voir tous les utilisateurs',
    'users.active': 'Actif',
    'users.pending': 'En attente',
    'users.inactive': 'Inactif',
    
    // Audit Logs
    'audit.logs': 'Journaux d\'audit récents',
    'audit.system_activity': 'Suivi de l\'activité système et des actions utilisateur',
    'audit.view_all': 'Voir tous les journaux',
    'audit.low': 'FAIBLE',
    'audit.medium': 'MOYEN',
    'audit.high': 'ÉLEVÉ',
    'audit.critical': 'CRITIQUE',
    
    // System Alerts
    'alerts.system_alerts': 'Alertes système',
    'alerts.notifications': 'Notifications système récentes et événements',
    'alerts.view_all': 'Voir toutes les alertes',
    
    // Enhanced System Status
    'system.enhanced_status': 'Statut du système',
    'system.service_monitoring': 'Surveillance de la santé de la plateforme et du statut des services',
    'system.operational': 'Opérationnel',
    'system.online': 'En ligne',
    'system.available': 'Disponible',
    'system.active': 'Actif',
    'system.hipaa_compliant': 'Conforme HIPAA • Certifié Loi 25 Québec • SOC 2 Type II • Sécurité de niveau médical',
    
    // Buttons and Actions
    'buttons.new_form': 'Nouveau formulaire',
    'buttons.view_drafts': 'Voir les brouillons',
    'buttons.export_reports': 'Exporter les rapports',
    'buttons.voice_recording': 'Enregistrement vocal',
    'buttons.refresh': 'Actualiser',
    'buttons.invite_user': 'Inviter un utilisateur',
    'buttons.start_training': 'Commencer la formation',
    'buttons.stop_training': 'Arrêter la formation',
    'buttons.training_settings': 'Paramètres de formation',
    'buttons.export_model': 'Exporter le modèle',
    'buttons.view_all_forms': 'Voir tous les formulaires',
    'buttons.view_all_exports': 'Voir tous les exports',
    'buttons.view_all_users': 'Voir tous les utilisateurs',
    'buttons.view_all_logs': 'Voir tous les journaux',
    'buttons.view_all_alerts': 'Voir toutes les alertes',
    
    // Status Messages
    'status.auto_saved': 'Sauvegarde auto 2 min',
    'status.online': 'En ligne',
    'status.offline': 'Hors ligne',
    'status.excellent': 'excellent',
    'status.good': 'bon',
    'status.poor': 'mauvais',
    
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.admin_dashboard': 'Tableau de bord admin',
    'nav.user_management': 'Gestion des utilisateurs',
    'nav.ai_training': 'Formation IA',
    'nav.analytics': 'Analyses',
    'nav.new_form': 'Nouveau formulaire',
    'nav.drafts': 'Brouillons',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    
    // Form Sections
    'sections.patient_info': 'Information du patient',
    'sections.physician_info': 'Information du médecin',
    'sections.report_overview': 'Aperçu du rapport',
    'sections.identification': 'Identification et contexte',
    'sections.medical_history': 'Antécédents médicaux',
    'sections.current_treatment': 'Traitement actuel',
    'sections.physical_exam': 'Examen physique',
    'sections.subjective_assessment': 'Évaluation subjective',
    'sections.physical_tables': 'Tableaux d\'examen physique',
    'sections.additional_tests': 'Tests supplémentaires',
    'sections.medical_conclusions': 'Conclusions médicales',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.warning': 'Avertissement',
    'common.info': 'Information',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.view': 'Voir',
    'common.download': 'Télécharger',
    'common.upload': 'Téléverser',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.refresh': 'Actualiser',
    'common.close': 'Fermer',
    'common.open': 'Ouvrir',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.ok': 'OK',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.finish': 'Terminer',
    'common.submit': 'Soumettre',
    'common.reset': 'Réinitialiser',
    'common.clear': 'Effacer',
    'common.select': 'Sélectionner',
    'common.choose': 'Choisir',
    'common.browse': 'Parcourir',
    'common.upload_file': 'Téléverser un fichier',
    'common.download_file': 'Télécharger un fichier',
    'common.view_details': 'Voir les détails',
    'common.hide_details': 'Masquer les détails',
    'common.expand': 'Développer',
    'common.collapse': 'Réduire',
    'common.show_more': 'Afficher plus',
    'common.show_less': 'Afficher moins',
    'common.select_all': 'Tout sélectionner',
    'common.deselect_all': 'Tout désélectionner',
    'common.select_none': 'Ne rien sélectionner',
    'common.select_inverse': 'Sélection inverse',
    'common.select_page': 'Sélectionner la page',
    'common.deselect_page': 'Désélectionner la page',
    'common.select_range': 'Sélectionner la plage',
    'common.deselect_range': 'Désélectionner la plage',
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage when it changes
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  // Translation function
  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key
  }

  // Get text function for simple en/fr pairs
  const getText = (en: string, fr: string): string => {
    return language === 'en' ? en : fr
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    getText
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
