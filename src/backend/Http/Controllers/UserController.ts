/**
 * UserController
 * 
 * Resource controller for user management
 */

import { NextRequest, NextResponse } from 'next/server';

export class UserController {
  /**
   * Display a listing of the resource
   */
  async index(request: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ data: [] });
  }

  /**
   * Store a newly created resource
   */
  async store(request: NextRequest): Promise<NextResponse> {
    const data = await request.json();
    return NextResponse.json({ data }, { status: 201 });
  }

  /**
   * Display the specified resource
   */
  async show(request: NextRequest, id: string): Promise<NextResponse> {
    return NextResponse.json({ data: { id } });
  }

  /**
   * Update the specified resource
   */
  async update(request: NextRequest, id: string): Promise<NextResponse> {
    const data = await request.json();
    return NextResponse.json({ data: { id, ...data } });
  }

  /**
   * Remove the specified resource
   */
  async destroy(request: NextRequest, id: string): Promise<NextResponse> {
    return NextResponse.json(null, { status: 204 });
  }
}

export default new UserController();
