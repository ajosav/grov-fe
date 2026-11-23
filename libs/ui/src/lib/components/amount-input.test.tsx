import {fireEvent, render, screen} from '@testing-library/react';

import {AmountInput} from './amount-input';

describe('AmountInput', () => {
  it('turns typed naira into kobo and shows separators', () => {
    const onChangeKobo = vi.fn();
    render(<AmountInput aria-label="Budget" valueKobo={null} onChangeKobo={onChangeKobo} />);
    const input = screen.getByRole('textbox', {name: 'Budget'});
    fireEvent.change(input, {target: {value: '150000'}});
    expect(onChangeKobo).toHaveBeenLastCalledWith(15_000_000);
    expect(input).toHaveValue('150,000');
  });
  it('ignores letters, caps at the max and clears to null', () => {
    const onChangeKobo = vi.fn();
    render(
      <AmountInput
        aria-label="Budget"
        valueKobo={null}
        onChangeKobo={onChangeKobo}
        maxNaira={1000}
      />
    );
    const input = screen.getByRole('textbox', {name: 'Budget'});
    fireEvent.change(input, {target: {value: '12a345'}});
    expect(onChangeKobo).toHaveBeenLastCalledWith(100_000);
    fireEvent.change(input, {target: {value: ''}});
    expect(onChangeKobo).toHaveBeenLastCalledWith(null);
  });
});
