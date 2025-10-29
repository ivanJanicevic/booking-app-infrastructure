import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
  imports: [CommonModule, FormsModule],
})
export class BlogListComponent implements OnInit {

  turistaId: string | null = null;
  

  blogs = [
    {
      title: 'Moja prva blog tura',
      description: 'Ovo je moj prvi blog o planinama!',
      likes: 1,
      comments: [{ text: 'Super blog!' }, { text: 'Odlične slike!' }],
      showComments: false,
      newComment: ''
    },
    {
      title: 'Putovanje kroz Dalmaciju',
      description: 'Divno iskustvo, prelepo more i sunce.',
      likes: 1,
      comments: [],
      showComments: false,
      newComment: ''
    }
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}
ngOnInit(): void {
  alert('pocelo')
  this.turistaId = this.authService.getUsername(); 
}

  likeBlog(blog: any) {
    this.getUserIdFromToken();
    const apiUrl = "http://localhost:8080/api/blogs/blogs/like?id=68ea4afedd6d6d5ebeb0ce47&user="+ this.turistaId;

    this.http.post(apiUrl, null).subscribe({
      next: (response) => {
        console.log('Lajk je uspešno poslat na server!', response);
        blog.likes++;
      },
      error: (err) => {
        console.error('Došlo je do greške prilikom slanja lajka:', err);
      }
    });
  }

  toggleComments(blog: any) {
    blog.showComments = !blog.showComments;
  }

  addComment(blog: any) {
    if (blog.newComment.trim()) {
      blog.comments.push({ text: blog.newComment });
      blog.newComment = '';
    }
  }

getUserIdFromToken(): void {
    const user = this.authService.getUser(); 

    if (user) { 
      this.turistaId = user.sub; 
      console.log('ID korisnika (username):', this.turistaId);
    } else {
      console.error("Korisnik nije prijavljen, ID nije dostupan.");
      this.turistaId = null;
    }
  }
}
