import React from 'react';
type ContentCardProps = {
    id: string;
    active?: boolean;
    onClick?: Function;
};
export declare const ContentCard: ({ id, active, onClick }: ContentCardProps) => React.JSX.Element;
export {};
