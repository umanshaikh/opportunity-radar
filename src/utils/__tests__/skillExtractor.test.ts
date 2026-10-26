import { describe, it, expect } from 'vitest'
import { extractProfileFromText } from '../skillExtractor'

describe('skillExtractor', () => {
  it('handles empty or invalid text safely', () => {
    expect(extractProfileFromText('')).toEqual({
      skills: [],
      interests: [],
      educationLevel: undefined,
      matchedKeywordCount: 0,
    })
  })

  it('extracts technical skills and education from a student resume summary', () => {
    const resumeText = `
      Third-year B.Tech Computer Science Undergraduate at Apex Institute.
      Passionate about Web Development and AI/ML.
      Proficient in Python, React, TypeScript, Node.js, and PostgreSQL.
      Experience deploying containerized applications with Docker and AWS.
      Active contributor on GitHub with knowledge of Git and Linux.
    `

    const result = extractProfileFromText(resumeText)

    expect(result.educationLevel).toBe('Undergraduate')
    expect(result.skills).toContain('Python')
    expect(result.skills).toContain('React')
    expect(result.skills).toContain('TypeScript')
    expect(result.skills).toContain('Docker')
    expect(result.skills).toContain('AWS')
    expect(result.interests).toContain('AI/ML')
    expect(result.interests).toContain('Web Development')
    expect(result.matchedKeywordCount).toBeGreaterThan(5)
  })

  it('detects postgraduate education level and research interests', () => {
    const text = `
      M.Tech candidate researching Deep Learning and Computer Vision.
      Implemented convolutional neural networks using PyTorch and OpenCV.
      Authored research paper on arXiv.
    `
    const result = extractProfileFromText(text)
    expect(result.educationLevel).toBe('Postgraduate')
    expect(result.skills).toContain('PyTorch')
    expect(result.skills).toContain('Computer Vision')
    expect(result.skills).toContain('Deep Learning')
    expect(result.interests).toContain('Research')
  })
})
