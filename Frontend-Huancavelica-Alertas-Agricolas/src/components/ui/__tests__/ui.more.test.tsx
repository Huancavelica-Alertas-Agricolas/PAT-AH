import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as UI from '../index';

describe('UI Monolito extra', () => {
  it('Checkbox cambia aria-checked al hacer click', () => {
    render(<UI.Checkbox aria-label="check" />);
    const cb = screen.getByRole('checkbox', { name: 'check' });
    expect(cb).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(cb);
    expect(cb).toHaveAttribute('aria-checked', 'true');
  });

  it('Dialog open muestra contenido', () => {
    render(
      <UI.Dialog open>
        <UI.DialogContent>Contenido</UI.DialogContent>
      </UI.Dialog>
    );
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });
});
