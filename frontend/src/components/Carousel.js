import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import FloatingCourses from "./ui/FloatingCourses"
import FloatingProfessors from "./ui/FloatingProfessors"
import FloatingPlanner from './ui/FloatingPlanner'

// replace icons with your own if needed
import "../styles/carousel.css";

const professors = [
  "Dr. Smith", "Prof. Johnson", "Dr. Williams", "Prof. Brown",
  "Dr. Davis", "Prof. Miller", "Dr. Wilson", "Prof. Moore",
  "Dr. Taylor", "Prof. Anderson", "Dr. Thomas", "Prof. Jackson",
  "Dr. White", "Prof. Harris", "Dr. Martin"
]

const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA",
  "#FF8A80", "#80CBC4", "#90CAF9"
]

const professorColors = [
  "#FFB3BA", "#BAFFC9", "#BAE1FF", "#FFFFBA",
  "#FFD1DC", "#E0BBE4", "#C7CEEA", "#FFDAB9",
  "#B5EAD7", "#C9C9FF", "#FFE5CC", "#D4F1F4"
]

const courseCodes = ["CSCE101", "MATH241", "PHYS212", "BIOL112", "STAT302", "HIST105", "CSCE 222", "ECEN 248", "CSCE 221"]

const DEFAULT_ITEMS = [
  {
    title: "500+ Courses",
    description: "Lorem ipsum dolor sit amet",
    id: 1,
    icon: <FloatingCourses courseCodes={courseCodes} colors={colors} />
  },
  {
    title: "500+ Professors",
    description: "Lorem ipsum dolor sit amet",
    id: 2,
    icon: <FloatingProfessors professors={professors} colors={professorColors} />
  },
  {
    title: "Degree Planner",
    description: "Plan your academic journey effectively",
    id: 3,
    icon: <FloatingPlanner colors={professorColors} />,
  }
]

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const containerRef = useRef(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  useEffect(() => {
  if (autoplay && (!pauseOnHover || !isHovered)) {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (loop) {
          if (prev >= items.length) {
            // Prevent index going beyond duplicated slide
            return 0;
          }
          return prev + 1;
        } else {
          if (prev >= items.length - 1) {
            return prev; // stop at last slide
          }
          return prev + 1;
        }
      });
    }, autoplayDelay);
    return () => clearInterval(timer);
  }
}, [autoplay, autoplayDelay, isHovered, loop, pauseOnHover, items.length]);

const itemCount = items.length;
const totalItems = loop ? itemCount + 1 : itemCount; // +1 for duplicate slide

const handleAnimationComplete = () => {
  if (!loop) return;

  if (currentIndex === totalItems - 1) {
    // If on duplicate slide, snap instantly back to slide 0
    setIsResetting(true);
    x.set(0);
    setCurrentIndex(0);
    setTimeout(() => setIsResetting(false), 50);
  } else if (currentIndex === 0 && isResetting) {
    // If you implement reverse infinite scroll, handle here as needed
  }
};


// On drag end:
const handleDragEnd = (_, info) => {
  const offset = info.offset.x;
  const velocity = info.velocity.x;

  if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
    // Next slide logic
    if (loop && currentIndex === itemCount) {
      // We're on duplicate last slide, reset to 0 instantly
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1));
    }
  } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
    // Previous slide logic
    if (loop && currentIndex === 0) {
      // We're on first slide and dragging left - jump to duplicate slide instantly
      setIsResetting(true);
      x.set(-itemCount * trackItemOffset);
      setCurrentIndex(itemCount);
      setTimeout(() => setIsResetting(false), 50);
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  }
};

  const dragProps = loop
    ? {}
    : {
      dragConstraints: {
        left: -trackItemOffset * (carouselItems.length - 1),
        right: 0,
      },
    };

  return (
    <div
      ref={containerRef}
      className={`carousel-container ${round ? "round" : ""}`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px`, borderRadius: "50%" }),
      }}
    >
      <motion.div
        className="carousel-track"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const outputRange = [90, 0, -90];
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          return (
            <motion.div
              key={index}
              className={`carousel-item ${round ? "round" : ""}`}
              style={{
                width: itemWidth,
                height: round ? itemWidth : "100%",
                rotateY: rotateY,
                ...(round && { borderRadius: "50%" }),
              }}
              transition={effectiveTransition}
            >
              <div className={`carousel-item-header ${round ? "round" : ""}`}>
                <span className="carousel-icon-container">
                  {item.icon}
                </span>
              </div>
              <div className="carousel-item-content">
                <div className="carousel-item-title">{item.title}</div>
                <p className="carousel-item-description">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <div className={`carousel-indicators-container ${round ? "round" : ""}`}>
        <div className="carousel-indicators">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`carousel-indicator ${currentIndex % items.length === index ? "active" : "inactive"
                }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.2 : 1,
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
