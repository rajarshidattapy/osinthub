import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`p-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div className={`p-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}
