/** Slow, smooth easing for admin dashboard (luxury feel) */
export const adminEase = [0.22, 1, 0.36, 1];

export const adminDuration = {
  fast: 0.45,
  normal: 0.7,
  slow: 0.9,
};

export const adminReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: adminDuration.normal, ease: adminEase },
  },
};

export const adminFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: adminDuration.fast, ease: adminEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.4, ease: adminEase },
  },
};

export const adminStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.12 },
  },
};

export const adminItem = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: adminDuration.normal, ease: adminEase },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.99,
    transition: { duration: 0.5, ease: adminEase },
  },
};

export const adminTableRow = {
  hidden: { opacity: 0, x: -16 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: adminDuration.normal,
      ease: adminEase,
      delay: Math.min(i * 0.07, 0.56),
    },
  }),
};

export const adminModalOverlay = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: adminEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.45, ease: adminEase },
  },
};

export const adminModalPanel = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: adminDuration.slow, ease: adminEase },
  },
  exit: {
    opacity: 0,
    y: 24,
    scale: 0.97,
    transition: { duration: 0.55, ease: adminEase },
  },
};

export const adminListSwap = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: adminDuration.normal, ease: adminEase },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.45, ease: adminEase },
  },
};
