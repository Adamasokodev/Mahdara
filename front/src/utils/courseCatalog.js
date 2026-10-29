import { API_URL } from "../config/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function getCourseImageUrl(course) {
  const image = course.image_url || course.image_path || course.image;
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;

  return `${API_ORIGIN}/${image.replace(/^\/+/, "")}`;
}

export function getCoursePlaceholder(category = "") {
  const normalizedCategory = category.toLocaleLowerCase("fr");
  if (normalizedCategory.includes("coran")) {
    return "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1000&q=85";
  }
  if (normalizedCategory.includes("arabe")) {
    return "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1000&q=85";
  }
  return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=85";
}

export function toCatalogCourse(course) {
  const duration = course.duree_minutes ?? (
    course.duree_secondes ? Math.ceil(course.duree_secondes / 60) : null
  );
  const teacher = course.cheikh?.user;
  const category = course.matiere_detail?.nom
    || (typeof course.matiere === "string" ? course.matiere : course.matiere?.nom)
    || course.category
    || "Autres";

  return {
    id: String(course.id),
    serverId: course.id,
    title: course.titre || course.title || "",
    category,
    description: course.contenu || course.description || "",
    level: course.niveau || "Niveau non précisé",
    duration: duration ? Number(duration) : null,
    book: course.livre || "",
    language: course.langue || "",
    mahdara: [course.mahdara?.nom, course.mahdara?.wilaya].filter(Boolean).join(" · "),
    mediaType: course.type_media || course.type || "",
    mediaUrl: course.fichier_url || null,
    excerptUrl: course.extrait_url || null,
    image: getCourseImageUrl(course),
    teacher: [teacher?.prenom, teacher?.name].filter(Boolean).join(" ")
      || course.cheikh?.nom
      || "Enseignants de la Mahdara",
    icon: course.matiere_detail?.icone || (course.type_media === "video" ? "▶" : "♫"),
    color: "#DCEBE3",
  };
}
