import { motion } from 'framer-motion';

export default function TeamMemberCard({ member, index = 0, reduceMotion = false }) {
  const { name, role, bio, image, initials, specialties } = member;

  return (
    <motion.article
      className="team-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.22 } }}
    >
      <div className="team-card__media">
        {image ? (
          <img src={image} alt={name} className="team-card__img" loading="lazy" decoding="async" />
        ) : (
          <span className="team-card__avatar" aria-hidden>
            {initials}
          </span>
        )}
      </div>
      <div className="team-card__body">
        <h2 className="team-card__name">{name}</h2>
        <p className="team-card__role">{role}</p>
        {bio ? <p className="team-card__bio">{bio}</p> : null}
        {specialties.length > 0 ? (
          <ul className="team-card__tags" aria-label={`${name} specialties`}>
            {specialties.map((tag) => (
              <li key={tag} className="team-card__tag">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.article>
  );
}
