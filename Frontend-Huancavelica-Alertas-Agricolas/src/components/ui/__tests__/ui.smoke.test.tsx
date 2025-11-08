import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as UI from '../index';

// Smoke tests para asegurar que los componentes principales renderizan sin crash.

describe('UI Monolito smoke', () => {
  it('Button renderiza con texto', () => {
    render(<UI.Button>Hola</UI.Button>);
    expect(screen.getByRole('button', { name: 'Hola' })).toBeInTheDocument();
  });

  it('Select composable (Select + Trigger + Content) renderiza sin error', () => {
    render(
      <UI.Select>
        <UI.SelectTrigger>Opciones</UI.SelectTrigger>
        <UI.SelectContent>
          <UI.SelectItem value="a">A</UI.SelectItem>
          <UI.SelectItem value="b">B</UI.SelectItem>
        </UI.SelectContent>
      </UI.Select>
    );
    expect(screen.getByText('Opciones')).toBeInTheDocument();
  });

  it('AlertDialog estructura básica (sin abrir)', () => {
    render(
      <UI.AlertDialog>
        <UI.AlertDialogTrigger>Open</UI.AlertDialogTrigger>
      </UI.AlertDialog>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});
