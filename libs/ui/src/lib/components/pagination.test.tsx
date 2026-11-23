import {fireEvent, render, screen} from '@testing-library/react';

import {Pagination} from './pagination';

describe('Pagination', () => {
  it('shows the range, marks the current page and collapses far pages', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={5} pageCount={20} total={390} pageSize={20} onPageChange={onPageChange} />
    );
    expect(screen.getByText('81–100 of 390')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Page 5'})).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('button', {name: 'Page 10'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Next page'}));
    expect(onPageChange).toHaveBeenCalledWith(6);
  });
});
