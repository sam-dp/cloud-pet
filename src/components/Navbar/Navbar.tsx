import Link from "next/link";
import styles from "./Navbar.module.css";  // Optional: Add styles to the navbar

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navLinks}>
        <li>
          <Link href="/">Home</Link> {/* Link to homepage */}
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link> {/* Link to dashboard */}
        </li>
        <li>
          <Link href="/profile">Profile</Link> {/* Link to user profile */}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
