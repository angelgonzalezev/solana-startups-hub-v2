'use client';

import StackCardItem from '../ui/stack-card/StackCardItem';
import StackCards from '../ui/stack-card/StackCardWrapper';

// Example 1: Simple usage with default settings
export const BasicStackCards = () => {
  return (
    <StackCards className="max-w-md mx-auto">
      <StackCardItem>
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <h3>Card 1</h3>
          <p>This is the first card</p>
        </div>
      </StackCardItem>
      <StackCardItem>
        <div className="bg-green-500 text-white p-6 rounded-lg">
          <h3>Card 2</h3>
          <p>This is the second card</p>
        </div>
      </StackCardItem>
      <StackCardItem>
        <div className="bg-red-500 text-white p-6 rounded-lg">
          <h3>Card 3</h3>
          <p>This is the third card</p>
        </div>
      </StackCardItem>
    </StackCards>
  );
};

// Example 2: Custom positioning and gap
export const CustomStackCards = () => {
  return (
    <StackCards topOffset="20vh" gap="30px" className="max-w-lg mx-auto">
      <StackCardItem>
        <div className="bg-purple-500 text-white p-8 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold">Feature 1</h3>
          <p>Custom positioned stack cards</p>
        </div>
      </StackCardItem>
      <StackCardItem>
        <div className="bg-indigo-500 text-white p-8 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold">Feature 2</h3>
          <p>With larger gaps between cards</p>
        </div>
      </StackCardItem>
    </StackCards>
  );
};

// Example 3: Using the hook directly for more control
import { useStackCards } from '../../hooks/useStackCards';

export const HookBasedStackCards = () => {
  const { stackCardsProps } = useStackCards({
    topOffset: '40vh',
    gap: '15px',
    initDelay: 200,
  });

  return (
    <div {...stackCardsProps} className="max-w-sm mx-auto">
      <StackCardItem>
        <div className="bg-orange-500 text-white p-4 rounded">
          <h4>Hook-based</h4>
          <p>Using the hook directly</p>
        </div>
      </StackCardItem>
      <StackCardItem>
        <div className="bg-teal-500 text-white p-4 rounded">
          <h4>More Control</h4>
          <p>For advanced use cases</p>
        </div>
      </StackCardItem>
    </div>
  );
};
