// PopupComponent.tsx

import React, { Component } from 'react';
import './PopupComponent.css';

export interface PopupComponentProps
{
	children : React.ReactNode;
	onClose : () => void;
}

export class PopupComponent extends Comp