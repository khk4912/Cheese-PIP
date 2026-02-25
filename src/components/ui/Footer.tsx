import styles from './Footer.module.css'

const VERSION = import.meta.env.VITE_APP_VERSION as string

function Footer () {
  return (
    <>
      <div className={styles.footer}>
        <div className={styles.footerList}>
          <a href='https://github.com/khk4912/Cheese-PIP' target='_blank' rel='noopener noreferrer' tabIndex={-1}>
            <button className={styles.infoButton}>GitHub</button>
          </a>
          <a href='mailto:kosame@kosame.dev' tabIndex={-1}><button className={styles.infoButton}>문의 (메일)</button></a>
        </div>
        <span className={styles.footerText}>
          Cheese-PIP v{VERSION}, Made with ❤️ by kosame. <br />
          Cheese-PIP는 네이버 치지직(chzzk)과 무관한 개인 프로젝트입니다.
        </span>
      </div>
    </>
  )
}

export default Footer
