/**
 * F1 车队视觉标识：官方主色 + 2026 赛季车队徽标（已本地化到 public/f1-teams）。
 * 主色取自 OpenF1 2026 赛季车队配色，不含 # 前缀（与 F1DriverStanding.teamColor 一致）。
 * 该文件同时被服务端与客户端引用，不要引入 Node 专属依赖。
 */

/** F1 官网素材目录名，用于拼接官方车手定妆照地址。 */
const F1_MEDIA_BASE =
  "https://media.formula1.com/image/upload/c_fill,g_face,w_200,h_200,q_auto/v1740000001/common/f1/2026"

export interface F1TeamMeta {
  /** F1 官网素材目录名（如 redbullracing） */
  slug: string
  /** 车队主色，不含 # */
  color: string
  /** 本地徽标路径 */
  logo: string
}

/** Jolpica constructorId → 车队视觉标识 */
export const F1_TEAMS: Record<string, F1TeamMeta> = {
  mercedes: { slug: "mercedes", color: "00d7b6", logo: "/f1-teams/mercedes.webp" },
  ferrari: { slug: "ferrari", color: "ed1131", logo: "/f1-teams/ferrari.webp" },
  mclaren: { slug: "mclaren", color: "f47600", logo: "/f1-teams/mclaren.webp" },
  red_bull: {
    slug: "redbullracing",
    color: "4781d7",
    logo: "/f1-teams/redbullracing.webp",
  },
  rb: { slug: "racingbulls", color: "6c98ff", logo: "/f1-teams/racingbulls.webp" },
  alpine: { slug: "alpine", color: "00a1e8", logo: "/f1-teams/alpine.webp" },
  haas: { slug: "haasf1team", color: "9c9fa2", logo: "/f1-teams/haasf1team.webp" },
  audi: { slug: "audi", color: "f50537", logo: "/f1-teams/audi.webp" },
  williams: { slug: "williams", color: "1868db", logo: "/f1-teams/williams.webp" },
  aston_martin: {
    slug: "astonmartin",
    color: "229971",
    logo: "/f1-teams/astonmartin.webp",
  },
  cadillac: { slug: "cadillac", color: "909090", logo: "/f1-teams/cadillac.webp" },
}

export function f1TeamMeta(constructorId: string | undefined | null): F1TeamMeta | null {
  if (!constructorId) return null
  return F1_TEAMS[constructorId] ?? null
}

/** 去掉变音符号与空格，得到 F1 素材命名用的纯 ASCII 名字。 */
function asciiName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
}

/**
 * F1 官方当季车手定妆照（按人脸裁成正方形），跟随车队与赛季自动更新。
 * F1 素材命名规则：姓前 3 位 + 名前 3 位 + 01，如 Lando Norris → lannor01。
 */
export function f1DriverHeadshot(
  givenName: string,
  familyName: string,
  constructorId: string,
): string | null {
  const team = f1TeamMeta(constructorId)
  if (!team) return null

  const given = asciiName(givenName).slice(0, 3).toLowerCase()
  const family = asciiName(familyName).slice(0, 3).toLowerCase()
  if (given.length < 3 || family.length < 3) return null

  const slug = `${given}${family}01`
  return `${F1_MEDIA_BASE}/${team.slug}/${slug}/2026${team.slug}${slug}right.webp`
}
