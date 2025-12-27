import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../Header'

// Mock the navigation data
jest.mock('../../../data/navigation', () => ({
  navigationItems: [
    { label: 'Home', path: '/', description: 'Overview' },
    { label: 'Research', path: '/research', description: 'Research details' },
  ],
}))

const HeaderWithRouter = () => (
  <BrowserRouter>
    <Header />
  </BrowserRouter>
)
describe('Header', () => {
  it('renders the logo and navigation items', () => {
    render(<HeaderWithRouter />)

    // Check logo exists (it's an icon, not text)
    expect(screen.getByLabelText('Home')).toBeInTheDocument()

    // Check navigation items
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Research')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<HeaderWithRouter />)

    // Check main navigation has proper label
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()

    // Check logo has proper aria-label (it's just "Home", not "Energy Research Showcase - Home")
    expect(screen.getByLabelText('Home')).toBeInTheDocument()

    // Check mobile menu button exists
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    expect(menuButton).toBeInTheDocument()
  })
})
