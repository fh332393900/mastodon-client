import React, { Fragment } from 'react'
import { parse } from 'ultrahtml'
import { decode } from 'tiny-decode'

import { normalizeProps, extractText } from './utils'
import type { mastodon } from 'masto'

import AccountHoverWrapper from '@/components/mastodon/AccountHoverWrapper'
import TagHoverWrapper from '@/components/mastodon/TagHoverWrapper'
import ContentCode from '@/components/mastodon/ContentCode'
import Link from 'next/link'

const ELEMENT_NODE = 1
const TEXT_NODE = 2
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

/** 把富文本字符串转换为React VNode */
export function contentToReactNode(
  content: string,
  emojis: mastodon.v1.CustomEmoji[] = [],
  currentServer?: string,
): React.ReactNode {
  const tree = parse(content)
  const emojiMap = buildEmojiMap(emojis)

  const nodes: React.ReactNode[] = []
  const children = tree.children || []

  for (let i = 0; i < children.length; i += 1) {
    const node = children[i]

    if (node?.type === ELEMENT_NODE && node.name === 'p') {
      const raw = getTextWithBreaks(node.children)

      if (raw?.trim().startsWith('```')) {
        let combined = raw
        let j = i + 1

        while (j < children.length && !combined.trim().endsWith('```')) {
          const next = children[j]
          const nextText = getTextWithBreaks(next?.children || [])
          combined += `\n${nextText}`
          if (combined.trim().endsWith('```')) break
          j += 1
        }

        const codeBlock = parseMarkdownCodeBlockFromText(combined)
        if (codeBlock) {
          nodes.push(<Fragment key={`md-code-${i}`}>{codeBlock}</Fragment>)
          i = j
          continue
        }
      }
    }

    nodes.push(<Fragment key={i}>{treeToReactNode(node, emojiMap, currentServer)}</Fragment>)
  }

  return <>{nodes}</>
}

export type DisplayNameLike = {
  displayName?: string | null
  username?: string | null
  emojis?: mastodon.v1.CustomEmoji[]
}

export function getDisplayNameText(input: DisplayNameLike) {
  const raw = input.displayName?.trim()
  if (raw) return raw
  return input.username?.trim() || ""
}

export function renderDisplayName(input: DisplayNameLike): React.ReactNode {
  const text = getDisplayNameText(input)
  const emojis = input.emojis || []
  return renderTextWithEmojis(text, buildEmojiMap(emojis))
}

function renderChildrenWithKeys(
  children: any[] = [],
  emojiMap: EmojiMap = {},
  currentServer?: string,
): React.ReactNode[] {
  return children.map((child: any, i: number) => (
    <Fragment key={i}>{treeToReactNode(child, emojiMap, currentServer)}</Fragment>
  ))
}

type EmojiMap = Record<string, { shortcode: string; url?: string | null }>

function treeToReactNode(node: any, emojiMap: EmojiMap, currentServer?: string): React.ReactNode {
  if (!node) return null

  if (node.type === TEXT_NODE) {
    return renderTextWithMarkdownAndEmojis(decode(node.value), emojiMap)
  }

  if (node.type === ELEMENT_NODE) {
    return elementToReactNode(node, emojiMap, currentServer)
  }

  return null
}

function elementToReactNode(
  node: any,
  emojiMap: EmojiMap,
  currentServer?: string,
): React.ReactNode {
  const { name, attributes = {}, children = [] } = node

  if (name === 'p') {
    const codeBlock = parseMarkdownCodeBlock(node)
    if (codeBlock) return codeBlock
  }

  // mention / hashtag
  if (name === 'a' && attributes.class?.includes('mention')) {
    const handled = handleMention(node, currentServer)
    if (handled) return handled
  }

  // code block
  if (name === 'pre') {
    const handled = handleCodeBlock(node)
    if (handled) return handled
  }

  // link
  if (name === 'a') {
    return renderLink(node, emojiMap, currentServer)
  }

  if (VOID_ELEMENTS.has(name)) {
    return React.createElement(name, normalizeProps(attributes))
  }

  return React.createElement(
    name,
    normalizeProps(attributes),
    renderChildrenWithKeys(children, emojiMap, currentServer),
  )
}

function handleMention(node: any, currentServer?: string): React.ReactNode | null {
  const href = node.attributes?.href
  if (!href) return null

  // user
  const userMatch = href.match(/https?:\/\/([^/]+)\/@([^/]+)/)
  if (userMatch) {
    const [, server, username] = userMatch
    const normalizedCurrent = currentServer?.toLowerCase()
    const normalizedMention = server.toLowerCase()
    const isSameServer = normalizedCurrent && normalizedCurrent === normalizedMention
    const handle = `${username}@${server}`
    const routeAccount = isSameServer ? username : handle
    const routeServer = currentServer || server
    const displayHandle = isSameServer ? `@${username}` : `@${handle}`

    return (
      <AccountHoverWrapper handle={handle}>
        <Link href={`/${routeServer}/@${routeAccount}`} className="text-primary hover:underline cursor-pointer">
          {displayHandle}
        </Link>
      </AccountHoverWrapper>
    )
  }

  // hashtag
  const tagMatch = href.match(/\/tags\/(.+)/)
  if (tagMatch) {
    const tag = tagMatch[1]

    return (
      <TagHoverWrapper tagName={tag}>
        <Link href={`/${currentServer}/tags/${tag}`} className="text-primary">
          {renderChildrenWithKeys(node.children, undefined, currentServer)}
        </Link>
      </TagHoverWrapper>
    )
  }

  return null
}

function renderLink(
  node: any,
  emojiMap: EmojiMap,
  currentServer?: string,
): React.ReactNode {
  const { attributes = {}, children = [] } = node

  return (
    <a {...normalizeProps(attributes)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline cursor-pointer">
      {children.map((child: any, i: number) => {
        if (
          child?.type === ELEMENT_NODE &&
          child.name !== 'bdi' &&
          child.attributes?.class?.includes('ellipsis')
        ) {
          return (
            <bdi key={i}>
              {renderChildrenWithKeys(child.children, emojiMap, currentServer)}
            </bdi>
          )
        }

        return <Fragment key={i}>{treeToReactNode(child, emojiMap, currentServer)}</Fragment>
      })}
    </a>
  )
}

function handleCodeBlock(node: any): React.ReactNode | null {
  if (node.name === 'pre' && node.children?.[0]?.name === 'code') {
    const codeEl = node.children[0]

    const classes = codeEl.attributes?.class || ''
    const lang = classes
      .split(/\s+/)
      .find((i: string) => i.startsWith('language-'))
      ?.replace('language-', '')

    const code = extractText(codeEl)

    return <ContentCode code={encodeURIComponent(code)} lang={lang} />
  }

  return null
}

function buildEmojiMap(emojis: mastodon.v1.CustomEmoji[]): EmojiMap {
  const map: EmojiMap = {}
  for (const emoji of emojis) {
    if (!emoji?.shortcode) continue
    map[emoji.shortcode] = { shortcode: emoji.shortcode, url: emoji.url || emoji.staticUrl }
  }
  return map
}

function renderTextWithEmojis(text: string, emojiMap: EmojiMap) {
  if (!text || !emojiMap || Object.keys(emojiMap).length === 0) return text

  const nodes: React.ReactNode[] = []
  const regex = /:([a-zA-Z0-9_+-]+):/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text))) {
    const [full, code] = match
    const start = match.index
    const end = start + full.length

    if (start > lastIndex) nodes.push(text.slice(lastIndex, start))

    const emoji = emojiMap[code]
    if (emoji?.url) {
      nodes.push(
        <img
          key={`emoji-${code}-${start}`}
          src={emoji.url}
          alt={`${code}`}
          title={`${code}`}
          className="inline h-4 w-4"
          loading="lazy"
        />,
      )
    } else {
      nodes.push(full)
    }

    lastIndex = end
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))

  return nodes.length === 1 ? nodes[0] : nodes
}

function renderTextWithMarkdownAndEmojis(text: string, emojiMap: EmojiMap): React.ReactNode {
  if (!text) return text

  const nodes: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text))) {
    const [token] = match
    const start = match.index
    const end = start + token.length

    if (start > lastIndex) {
      const raw = text.slice(lastIndex, start)
      nodes.push(renderTextWithEmojis(raw, emojiMap))
    }

    const content = token.startsWith('**') ? token.slice(2, -2) : token.slice(1, -1)
    const rendered = renderTextWithEmojis(content, emojiMap)
    nodes.push(
      token.startsWith('**') ? <strong key={`md-bold-${start}`}>{rendered}</strong> : <em key={`md-italic-${start}`}>{rendered}</em>,
    )

    lastIndex = end
  }

  if (lastIndex < text.length) {
    nodes.push(renderTextWithEmojis(text.slice(lastIndex), emojiMap))
  }

  return nodes.length === 1 ? nodes[0] : nodes
}

function parseMarkdownCodeBlock(node: any): React.ReactNode | null {
  const raw = getTextWithBreaks(node.children)
  return parseMarkdownCodeBlockFromText(raw)
}

function parseMarkdownCodeBlockFromText(raw: string): React.ReactNode | null {
  if (!raw?.trim().startsWith('```')) return null

  const normalized = raw.replace(/\r\n/g, '\n').trim()
  const match = normalized.match(/^```(\w+)?\n([\s\S]*?)\n```$/)
  if (!match) return null

  const [, lang, code] = match
  return <ContentCode code={encodeURIComponent(code)} lang={lang} />
}

function getTextWithBreaks(children: any[] = []): string {
  return children
    .map((child) => {
      if (child?.type === TEXT_NODE) return decode(child.value || '')
      if (child?.type === ELEMENT_NODE && child.name === 'br') return '\n'
      return extractText(child)
    })
    .join('')
}
