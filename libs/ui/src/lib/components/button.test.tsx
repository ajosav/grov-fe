import {render, screen} from '@testing-library/react';

import {Button} from './button';

describe('Button', () => {
  it('is a non-submitting button by default', () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole('button', {name: 'Continue'})).toHaveAttribute('type', 'button');
  });
  it('blocks clicks and reports busy while loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Pay
      </Button>
    );
    const button = screen.getByRole('button', {name: 'Pay'});
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
