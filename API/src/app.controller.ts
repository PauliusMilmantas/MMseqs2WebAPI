import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BearerGuard } from './bearer.guard';
import { EngineType, RabbitMqService } from './rabbitmq.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TicketService, TicketStatus } from './ticket.service';

@Controller()
export class AppController {
  constructor(
    private rabbitMqService: RabbitMqService,
    private ticketService: TicketService
  ) { }

  @UseGuards(BearerGuard)
  @ApiBearerAuth()
  @Post('submit')
  submit(@Query('sequences') sequencesData: string, @Query('engine') engine: EngineType, @Query('databaseType') dbType: string): Promise<string> {
    return  this.rabbitMqService.sendMessage(
      this.ticketService.getTicketQuery(sequencesData) ?? this.ticketService.generateTicket(sequencesData),
      sequencesData, 
      engine,
      dbType
    );
  }

  @UseGuards(BearerGuard)
  @ApiBearerAuth()
  @Get('status')
  status(@Query('ticket') ticket: string): TicketStatus {
    return this.ticketService.getTicketStatus(ticket);
  }

  @UseGuards(BearerGuard)
  @ApiBearerAuth()
  @Get('results')
  results(@Query('ticket') ticket: string): string {
    return this.ticketService.getTicketResults(ticket);
  }

  @Post('logResults')
  logResults(@Query('ticket') ticket: string, @Body('data') data: string) {
    console.log('Closing ticket ', ticket);
    this.ticketService.closeTicket(ticket, data);
  }
}